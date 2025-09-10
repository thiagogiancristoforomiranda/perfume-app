from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfume, Cart, CartItem, Order

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class PerfumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfume
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    perfume = PerfumeSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cart
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'