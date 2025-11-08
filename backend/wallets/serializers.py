from rest_framework import serializers
from .models import InstallmentBill

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