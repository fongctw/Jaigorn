from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegisterSerializer, UserDataSerializer
from .models import CustomUser

class UserMeView(generics.RetrieveAPIView):

    queryset = CustomUser.objects.all()
    serializer_class = UserDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return CustomUser.objects.select_related('wallet_account').get(pk=self.request.user.pk)

class UserRegisterView(generics.CreateAPIView):

    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer