from django.contrib import admin
from .models import Merchant, MerchantStatus, MerchantUser, Category
# Register your models here.
admin.site.register(Merchant)
admin.site.register(MerchantStatus)
admin.site.register(MerchantUser)
admin.site.register(Category)
