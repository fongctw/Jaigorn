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