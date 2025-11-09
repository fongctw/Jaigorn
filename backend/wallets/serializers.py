from rest_framework import serializers
from .models import InstallmentBill, WalletAccount, WalletTransaction
from decimal import Decimal
from django.utils import timezone

class CreditDataSerializer(serializers.ModelSerializer):

    available = serializers.SerializerMethodField()
    total = serializers.DecimalField(source='credit_limit', max_digits=10, decimal_places=2, read_only=True)
    currency = serializers.SerializerMethodField()

    class Meta:
        model = WalletAccount
        fields = ['available', 'total', 'currency']

    def get_available(self, obj: WalletAccount) -> Decimal:
        return obj.credit_limit - obj.balance_due

    def get_currency(self, obj: WalletAccount) -> str:
        return '฿'

class CustomerPaySerializer(serializers.Serializer):

    installment_months = serializers.IntegerField(
        min_value=1,
        max_value=12,
        default=1,
        help_text="จำนวนเดือนที่ต้องการผ่อน (1 คือจ่ายเต็มจำนวน)"
    )

class InstallmentBillSerializer(serializers.ModelSerializer):

    merchant_name = serializers.CharField(source='transaction.payment_request.merchant.name', read_only=True)

    class Meta:
        model = InstallmentBill
        fields = [
            'id',
            'amount_due',
            'due_date',
            'status',
            'merchant_name',
        ]


class HomeBillSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField()

    date = serializers.SerializerMethodField()

    amount = serializers.DecimalField(source='amount_due', max_digits=10, decimal_places=2)

    status = serializers.SerializerMethodField()

    class Meta:
        model = InstallmentBill
        fields = [
            'id',
            'title',
            'date',
            'amount',
            'status',
        ]

    def get_title(self, obj: InstallmentBill) -> str:
        if obj.status == 'PAID':
            return obj.due_date.strftime('%B %Y')
        else:
            try:
                merchant_name = obj.transaction.payment_request.merchant.name
                return f"Bill from {merchant_name}"
            except AttributeError:
                return "Next Coming Bill"

    def get_date(self, obj: InstallmentBill) -> str:
        if obj.status == 'PAID':
            return "Paid"

        today = timezone.localdate()
        days_left = (obj.due_date - today).days

        if days_left < 0:
            return f"Overdue {abs(days_left)} days"
        elif days_left == 0:
            return "Due Today"
        elif days_left == 1:
            return "1 day left"
        else:
            return f"{days_left} days left"

    def get_status(self, obj: InstallmentBill) -> str:
        if obj.status == 'PAID':
            return 'paid'
        elif obj.status == 'PENDING':
            return 'due'
        elif obj.status == 'OVERDUE':
            return 'overdue'
        return 'unknown'


class TransactionHistorySerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField()

    date = serializers.SerializerMethodField()

    timestamp = serializers.DateTimeField(source='created_at')

    amount = serializers.DecimalField(source='signed_amount', max_digits=10, decimal_places=2)

    status = serializers.SerializerMethodField()

    category = serializers.SerializerMethodField()

    merchantName = serializers.CharField(
        source='payment_request.merchant.name',
        read_only=True,
        default='Jaikorn Service'
    )

    location = serializers.SerializerMethodField()

    referenceId = serializers.UUIDField(source='payment_request.id', read_only=True)

    currency = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = [
            'id',
            'title',
            'date',
            'timestamp',
            'amount',
            'status',
            'category',     # (ยังไม่ทำ... มันช้า)
            'merchantName',
            'location',
            'referenceId',  # (Frontend อาจจะไม่ต้องการ... มันคือ 'payment_request.id')
            'currency',
        ]

    def get_title(self, obj: WalletTransaction) -> str:
        if obj.type_code == WalletTransaction.TxnType.PAYMENT:
            try:
                return obj.payment_request.merchant.name
            except AttributeError:
                return "Payment"
        elif obj.type_code == WalletTransaction.TxnType.REPAYMENT:
            return "Repayment to Jaikorn"
        return "Transaction"

    def get_date(self, obj: WalletTransaction) -> str:
        today = timezone.localdate()
        tx_date = obj.created_at.date()

        if tx_date == today:
            return "TODAY"
        elif tx_date == (today - timezone.timedelta(days=1)):
            return "YESTERDAY"
        else:
            return tx_date.strftime('%d %B %Y').upper()

    def get_status(self, obj: WalletTransaction) -> str:
        return "Completed"

    def get_category(self, obj: WalletTransaction) -> str:
        if obj.type_code == WalletTransaction.TxnType.PAYMENT:
            return "Shopping"
        else:
            return "Services"

    def get_location(self, obj: WalletTransaction) -> str:
        return "Bangkok, Thailand"

    def get_currency(self, obj: WalletTransaction) -> str:
        return "฿"

class WalletTransactionSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    amount = serializers.DecimalField(source='signed_amount', max_digits=10, decimal_places=2)

    class Meta:
        model = WalletTransaction
        fields = ['id', 'title', 'date', 'amount']

    def get_title(self, obj: WalletTransaction) -> str:

        if obj.type_code == WalletTransaction.TxnType.PAYMENT and obj.payment_request:
            return f"Payment to {obj.payment_request.merchant.name}"
        elif obj.type_code == WalletTransaction.TxnType.REPAYMENT:
            return "Repayment"
        return "General Transaction"

    def get_date(self, obj: WalletTransaction) -> str:

        today = obj.created_at.date()
        from django.utils import timezone
        if today == timezone.now().date():
            return "TODAY"

        return obj.created_at.strftime('%-d %B %Y').upper()
