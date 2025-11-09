from django.urls import path
from .views import MerchantRequestTransactionView, MerchantApplyView, CategoryListView, ShopDetailsView

urlpatterns = [

    path(
        'me/transactions/request/',
        MerchantRequestTransactionView.as_view(),
        name='merchant-request-transaction'
    ),

    path(
            'apply/',
            MerchantApplyView.as_view(),
            name='merchant-apply'
        ),

    path(
            'categories/',
            CategoryListView.as_view(),
            name='category-list'
        ),

    path(
            '<uuid:id>/details/',
            ShopDetailsView.as_view(),
            name='shop-details'
    ),
]
