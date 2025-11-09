from rest_framework import serializers
from wallets.models import PaymentRequest
from .models import Merchant, MerchantUser, MerchantStatus, Category
from django.core.validators import MinValueValidator
from decimal import Decimal
from rest_framework.validators import UniqueValidator

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


class MerchantApplySerializer(serializers.ModelSerializer):

    tax_id = serializers.CharField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=Merchant.objects.all(),
                message="Tax ID นี้ถูกลงทะเบียนแล้ว"
            )
        ]
    )

    class Meta:
        model = Merchant
        fields = [
            'name',
            'tax_id',
            'contact_email',
            'contact_phone'
        ]
        extra_kwargs = {
            'name': {'label': 'Shop Name'}
        }


class CategorySerializer(serializers.ModelSerializer):

    icon = serializers.CharField(source='icon_name')

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']