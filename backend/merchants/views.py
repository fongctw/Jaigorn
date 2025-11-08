from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import PaymentRequestCreateSerializer, PaymentRequestDisplaySerializer
from merchants.models import MerchantUser
from rest_framework.exceptions import PermissionDenied

class MerchantRequestTransactionView(generics.CreateAPIView):

    serializer_class = PaymentRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):

        try:
            merchant_link = MerchantUser.objects.get(user=self.request.user)
            merchant = merchant_link.merchant
        except MerchantUser.DoesNotExist:
            raise PermissionDenied("คุณไม่มีสิทธิ์ในการสร้าง QR (ไม่ใช่ร้านค้า)")

        serializer.save(merchant=merchant)

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        display_serializer = PaymentRequestDisplaySerializer(serializer.instance)

        headers = self.get_success_headers(display_serializer.data)
        return Response(display_serializer.data, status=status.HTTP_201_CREATED, headers=headers)