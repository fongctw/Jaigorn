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

class ShopCardSerializer(serializers.ModelSerializer):

    distance = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        fields = ['id', 'name', 'distance', 'image']

    def get_distance(self, obj) -> str:
        import random
        dist = random.uniform(0.1, 2.5)
        return f"{dist:.1f} km"

class CategorySerializer(serializers.ModelSerializer):

    title = serializers.CharField(source='name')
    data = ShopCardSerializer(source='merchants', many=True, read_only=True)

    class Meta:
            model = Category
            fields = ['title', 'data']