import logging
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.permissions import IsAuthenticated
# Create your views here.
from .serializers import CustomerPaySerializer, InstallmentBillSerializer
from .services import execute_bnpl_transaction, BNPLServiceError
from .models import PaymentRequest, InstallmentBill
from django.db.models import Q

logger = logging.getLogger(__name__)

class CustomerPayView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerPaySerializer
    queryset = PaymentRequest.objects.all()

    def post(self, request, pk, *args, **kwargs):

        payment_request = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            new_txn = execute_bnpl_transaction(
                user=request.user,
                payment_request_id=payment_request.id,
                installment_months=serializer.validated_data['installment_months']
            )
            return Response(
                {"message": "ชำระเงินสำเร็จ!", "transaction_id": new_txn.id},
                status=status.HTTP_201_CREATED
            )
        except BNPLServiceError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in CustomerPayView for payment_request {pk}: {e}", exc_info=True)
            return Response(
                {"error": "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UnpaidBillListView(generics.ListAPIView):

    serializer_class = InstallmentBillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        unpaid_statuses = Q(status=InstallmentBill.Status.PENDING) | Q(status=InstallmentBill.Status.OVERDUE)

        return InstallmentBill.objects.filter(
            account__user=user
        ).filter(
            unpaid_statuses
        ).select_related(
            'transaction__payment_request__merchant'
        )