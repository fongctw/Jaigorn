from django.db import models
import uuid
from django.conf import settings
# Create your models here.
class MerchantStatus(models.Model):
    code = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Merchant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    tax_id = models.CharField(max_length=20, unique=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to the merchant's cover image"
    )
    categories = models.ManyToManyField(
        'Category',
        related_name='merchants',
        blank=True
    )

    status = models.ForeignKey(
        MerchantStatus,
        on_delete=models.RESTRICT,
        default='ACTIVE'
    )

    receivable_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="ยอดจำลอง T+1 Settlement ที่ต้องโอนให้ร้าน"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class MerchantUser(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('merchant', 'user')

    def __str__(self):
        return f"{self.user.email} @ {self.merchant.name}"


class Category(models.Model):

    name = models.CharField(max_length=100, unique=True)

    icon_name = models.CharField(
        max_length=50,
        blank=True,
        help_text="ชื่อ Icon (เช่น 'fast-food', 'location-sharp')"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class ProductCategory(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='product_categories')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('merchant', 'name')
        verbose_name_plural = "Product Categories"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.merchant.name})"


class ProductFilter(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='product_filters')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('merchant', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.merchant.name})"


class Product(models.Model):

    id = models.CharField(primary_key=True, max_length=20, help_text="ID ที่ตรงกับ Frontend เช่น 'p1', 'p7'")
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='products')
    categories = models.ManyToManyField(ProductCategory, related_name='products', blank=True)

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(max_length=500, blank=True)
    description = models.TextField(blank=True)

    is_highlight = models.BooleanField(default=False, help_text="เลือกเพื่อแสดงเป็นสินค้าแนะนำ (Highlight)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name