from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import PaymentRequestCreateSerializer, PaymentRequestDisplaySerializer, MerchantApplySerializer, CategorySerializer, ShopDetailsSerializer
from .models import Merchant, MerchantUser, MerchantStatus, Category
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import Prefetch

class MerchantRequestTransactionView(generics.CreateAPIView):

    serializer_class = PaymentRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):

        try:
            merchant_link = MerchantUser.objects.select_related('merchant').get(user=self.request.user)
            merchant = merchant_link.merchant
        except MerchantUser.DoesNotExist:
            raise PermissionDenied("คุณไม่มีสิทธิ์ในการสร้าง QR (ไม่ใช่ร้านค้า)")

        if merchant.status.code != 'ACTIVE':
            raise ValidationError(f"ไม่สามารถสร้าง QR Code ได้ เนื่องจากสถานะของร้านค้าคือ '{merchant.status.name}'")

        serializer.save(merchant=merchant)

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        display_serializer = PaymentRequestDisplaySerializer(serializer.instance)

        headers = self.get_success_headers(display_serializer.data)
        return Response(display_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MerchantApplyView(generics.CreateAPIView):

    queryset = Merchant.objects.all()
    serializer_class = MerchantApplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if MerchantUser.objects.filter(user=request.user).exists():
            return Response(
                {"error": "คุณได้สมัครเป็นร้านค้าไปแล้ว"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():

                active_status = MerchantStatus.objects.get(code='ACTIVE')

                new_merchant = serializer.save(status=active_status)

                MerchantUser.objects.create(
                    user=request.user,
                    merchant=new_merchant
                )

        except MerchantStatus.DoesNotExist:
            return Response(
                {"error": "ระบบขัดข้อง: ไม่พบสถานะ 'ACTIVE'"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class CategoryListView(generics.ListAPIView):

    queryset = Category.objects.prefetch_related(
        Prefetch(
            'merchants',
            queryset=Merchant.objects.filter(status__code='ACTIVE')
        )
    ).order_by('name')

    serializer_class = CategorySerializer

    permission_classes = [permissions.AllowAny]

class ShopDetailsView(generics.RetrieveAPIView):

    serializer_class = ShopDetailsSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        return Merchant.objects.prefetch_related(
            'product_filters',
            'products',
            'product_categories__products'
        ).filter(status__code='ACTIVE')