from rest_framework import serializers
from wallets.models import PaymentRequest
from .models import Merchant, MerchantUser, MerchantStatus, Category, Product, ProductCategory
from django.core.validators import MinValueValidator
from decimal import Decimal
from rest_framework.validators import UniqueValidator
from .models import Product

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

class SimpleCategorySerializer(serializers.ModelSerializer):
    icon = serializers.CharField(source='icon_name')

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']

class CategorySerializer(serializers.ModelSerializer):

    title = serializers.CharField(source='name')
    data = ShopCardSerializer(source='merchants', many=True, read_only=True)

    class Meta:
            model = Category
            fields = ['title', 'data']

class ProductIdSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = ['id']

class ShopDetailCategorySerializer(serializers.ModelSerializer):

    title = serializers.CharField(source='name')
    products = serializers.StringRelatedField(many=True)

    class Meta:
        model = ProductCategory
        fields = ['title', 'products']

class ShopDetailsSerializer(serializers.ModelSerializer):

    filters = serializers.StringRelatedField(source='product_filters', many=True)
    highlight = serializers.SerializerMethodField()
    categories = ShopDetailCategorySerializer(source='product_categories', many=True)

    class Meta:
        model = Merchant
        fields = ['id', 'name', 'filters', 'highlight', 'categories']

    def get_highlight(self, obj: Merchant) -> list[str]:
        return list(obj.products.filter(is_highlight=True).values_list('id', flat=True))
    
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'description']