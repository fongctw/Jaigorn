from django.urls import path
from .views import CustomerPayView, UnpaidBillListView, RepayBillAPIView, CreditSummaryView, HomeBillListView, TransactionHistoryView, MyTransactionHistoryView

app_name = 'wallets'

urlpatterns = [

    path(
        'payment-requests/<uuid:pk>/pay/',
        CustomerPayView.as_view(),
        name='customer-pay-request'
    ),

    path(
        'bills/',
        UnpaidBillListView.as_view(),
        name='customer-unpaid-bills'
    ),

    path(
        'bills/<uuid:pk>/pay/',
        RepayBillAPIView.as_view(),
        name='customer-pay-bill'
    ),

    path(
        'me/summary/',
        CreditSummaryView.as_view(),
        name='customer-credit-summary'
    ),

    path(
        'home/bills/',
        HomeBillListView.as_view(),
        name='home-list-bills'
    ),

    path(
        'me/alltransactions/',
        TransactionHistoryView.as_view(),
        name='list-transactions'
    ),

    path(
        'me/transactions/',
        MyTransactionHistoryView.as_view(),
        name='my-transaction-history'
    ),

]