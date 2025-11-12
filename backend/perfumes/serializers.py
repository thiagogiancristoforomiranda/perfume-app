from rest_framework import serializers
from django.contrib.auth.models import User
# Profile foi adicionado
from .models import Perfume, Cart, CartItem, Order, Favorite, Address, Profile

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

# --- CÓDIGO NOVO ADICIONADO ---
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('phone', 'cpf', 'birth_date', 'gender')

class UserDetailSerializer(serializers.ModelSerializer):
    # 'profile' é o 'related_name' que definimos no Profile
    profile = ProfileSerializer()

    class Meta:
        model = User
        # Adicionamos os campos do User que queremos ver/editar
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')
        read_only_fields = ('username',) # Não deixamos o usuário mudar o username

    def update(self, instance, validated_data):
        # Lógica para salvar o perfil aninhado
        profile_data = validated_data.pop('profile', {})
        
        # Garante que 'profile' exista, mesmo para usuários antigos
        try:
            profile = instance.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=instance)

        # Atualiza os campos do User
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        # Atualiza os campos do Profile
        profile.phone = profile_data.get('phone', profile.phone)
        profile.cpf = profile_data.get('cpf', profile.cpf)
        profile.birth_date = profile_data.get('birth_date', profile.birth_date)
        profile.gender = profile_data.get('gender', profile.gender)
        profile.save()

        return instance
# --- FIM DO CÓDIGO NOVO ---

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

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']