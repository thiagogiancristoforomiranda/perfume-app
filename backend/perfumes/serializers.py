from rest_framework import serializers
from django.contrib.auth.models import User
# --- CÓDIGO MODIFICADO ---
from .models import Perfume, Cart, CartItem, Order, Favorite, Address
# --- FIM DA MODIFICAÇÃO ---

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
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = '__all__'
    
    def get_total_price(self, obj):
        return obj.quantity * obj.perfume.price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = '__all__'
    
    def get_total_price(self, obj):
        return sum(item.quantity * item.perfume.price for item in obj.items.all())
    
    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

class OrderItemSerializer(serializers.ModelSerializer):
    perfume = PerfumeSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'perfume', 'quantity', 'total_price']
    
    def get_total_price(self, obj):
        return obj.quantity * obj.perfume.price

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def get_items_count(self, obj):
        return obj.items.count()

class FavoriteSerializer(serializers.ModelSerializer):
    perfume = PerfumeSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'perfume', 'created_at']

# --- CÓDIGO ADICIONADO ---
# Serializador para o modelo de Endereço
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user'] # O usuário será pego automaticamente do request
# --- FIM DO CÓDIGO ADICIONADO ---