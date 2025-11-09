from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from decimal import Decimal

class UserRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="Username นี้มีคนใช้แล้ว")]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="Email นี้มีคนใช้แล้ว")]
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = CustomUser
        fields = ('username','email', 'password')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class UserDataSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()
    profileImageUrl = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'name',
            'profileImageUrl',
        ]

    def get_name(self, obj: CustomUser) -> str:
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username

    def get_profileImageUrl(self, obj: CustomUser) -> str:
        if obj.first_name and obj.last_name:
            initials = (obj.first_name[0] + obj.last_name[0]).upper()
        else:
            initials = obj.username[:2].upper()
        return f'https://placehold.co/100x100/E0EAE1/5DC270?text={initials}'