from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from dateutil.relativedelta import relativedelta
import uuid

from django.db import transaction
from django.utils import timezone
from django.conf import settings
from django.db.models import F

from .models import WalletAccount, PaymentRequest, WalletTransaction, InstallmentBill
from merchants.models import Merchant, MerchantUser

class BNPLServiceError(Exception):
    pass


@transaction.atomic
def execute_bnpl_transaction(
        *,
        user: settings.AUTH_USER_MODEL,
        payment_request_id: uuid.UUID,
        installment_months: int
) -> WalletTransaction:

    try:
        req = PaymentRequest.objects.get(id=payment_request_id)
    except PaymentRequest.DoesNotExist:
        raise BNPLServiceError("Payment Request นี้ไม่มีอยู่จริง")

    if req.status != PaymentRequest.Status.PENDING:

        if req.status == PaymentRequest.Status.PAID:
            raise BNPLServiceError("บิลนี้ถูกจ่ายไปแล้ว")
        if req.status == PaymentRequest.Status.EXPIRED:
            raise BNPLServiceError("QR นี้หมดอายุแล้ว")

        raise BNPLServiceError(f"ไม่สามารถทำรายการได้เนื่องจากสถานะเป็น '{req.status}'")

    amount = req.amount
    merchant = req.merchant

    is_self_payment = MerchantUser.objects.filter(
        user=user,
        merchant=merchant
    ).exists()

    if is_self_payment:
        raise BNPLServiceError("ร้านค้าไม่สามารถทำรายการชำระเงินให้ตัวเองได้")

    try:
        account = WalletAccount.objects.select_for_update().get(user=user)
    except WalletAccount.DoesNotExist:
        raise BNPLServiceError("ไม่พบบัญชีเครดิต (WalletAccount) ของผู้ใช้")

    available_credit = account.credit_limit - account.balance_due
    if available_credit < amount:
        raise BNPLServiceError(f"วงเงินไม่เพียงพอ (คงเหลือ: {available_credit})")

    new_txn = WalletTransaction.objects.create(
        account=account,
        type_code=WalletTransaction.TxnType.PAYMENT,
        signed_amount=amount,
        balance_due_after=account.balance_due + amount,
        payment_request=req
    )

    account.balance_due += amount
    account.save()

    req.status = PaymentRequest.Status.PAID
    req.customer = user
    req.paid_at = timezone.now()
    req.save()

    merchant.receivable_balance = F('receivable_balance') + amount
    merchant.save()

    monthly_amount = (amount / Decimal(installment_months)).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )

    final_amount = amount - (monthly_amount * (installment_months - 1))

    today = date.today()
    bills_to_create = []

    for i in range(installment_months):
        due_date = today + relativedelta(months=i + 1)

        current_amount = final_amount if (i == installment_months - 1) else monthly_amount

        bills_to_create.append(
            InstallmentBill(
                transaction=new_txn,
                account=account,
                amount_due=current_amount,
                due_date=due_date,
                status=InstallmentBill.Status.PENDING
            )
        )

    InstallmentBill.objects.bulk_create(bills_to_create)

    return new_txn

@transaction.atomic
def execute_bill_repayment(
    *,
    user: settings.AUTH_USER_MODEL,
    bill_id: uuid.UUID
) -> InstallmentBill:
    try:
        bill = InstallmentBill.objects.select_for_update().get(
            id=bill_id,
            account__user=user
        )
    except InstallmentBill.DoesNotExist:
        raise BNPLServiceError("ไม่พบบิลนี้ หรือคุณไม่มีสิทธิ์จ่าย")

    if bill.status == InstallmentBill.Status.PAID:
        raise BNPLServiceError("บิลนี้ถูกจ่ายไปแล้ว")

    account = bill.account
    amount_to_repay = bill.amount_due

    WalletTransaction.objects.create(
        account=account,
        type_code=WalletTransaction.TxnType.REPAYMENT,
        signed_amount=-amount_to_repay,
        balance_due_after=F('balance_due') - amount_to_repay,
    )

    account.balance_due = F('balance_due') - amount_to_repay
    account.save()

    bill.status = InstallmentBill.Status.PAID
    bill.paid_at = timezone.now()
    bill.save()

    return bill