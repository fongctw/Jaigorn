from django.urls import path
from .views import MerchantRequestTransactionView, MerchantApplyView

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
]
