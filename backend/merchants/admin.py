from django.contrib import admin
from .models import (
    Merchant, MerchantStatus, MerchantUser, Category,
    Product, ProductCategory, ProductFilter
)
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

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):

    list_display = ('name', 'merchant')
    list_filter = ('merchant',)
    search_fields = ('name', 'merchant__name')
    autocomplete_fields = ['merchant']

@admin.register(ProductFilter)
class ProductFilterAdmin(admin.ModelAdmin):

    list_display = ('name', 'merchant')
    list_filter = ('merchant',)
    search_fields = ('name', 'merchant__name')
    autocomplete_fields = ['merchant']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = ('name', 'id', 'merchant', 'price', 'is_highlight')
    list_filter = ('merchant', 'is_highlight', 'categories')
    search_fields = ('id', 'name', 'merchant__name')

    filter_horizontal = ('categories',)
    autocomplete_fields = ['merchant']

admin.site.register(MerchantStatus)
admin.site.register(MerchantUser)
