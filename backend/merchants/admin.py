from django.contrib import admin
from .models import Merchant, MerchantStatus, MerchantUser, Category
# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_name')
    search_fields = ('name', 'icon_name')


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'receivable_balance', 'created_at')
    list_filter = ('status', 'categories')
    search_fields = ('name', 'tax_id', 'contact_email')

    filter_horizontal = ('categories',)


admin.site.register(MerchantStatus)
admin.site.register(MerchantUser)
