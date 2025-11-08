from rest_framework import serializers
from wallets.models import PaymentRequest
from merchants.models import Merchant
from django.core.validators import MinValueValidator
from decimal import Decimal

class MerchantNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Merchant
        fields = ['id', 'name']

class PaymentRequestCreateSerializer(serializers.ModelSerializer):

    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('0.01'))
        ]
    )

    class Meta:
        model = PaymentRequest
        fields = ['amount']

class PaymentRequestDisplaySerializer(serializers.ModelSerializer):

    merchant = MerchantNameSerializer(read_only=True)

    class Meta:
        model = PaymentRequest
        fields = ['id', 'amount', 'status', 'merchant', 'created_at']