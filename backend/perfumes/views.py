from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
# Profile e Address foram adicionados
from .models import Perfume, Cart, CartItem, Order, Favorite, Address, Profile
from .serializers import (
    UserSerializer, PerfumeSerializer, 
    CartSerializer, CartItemSerializer, 
    OrderSerializer, FavoriteSerializer,
    AddressSerializer, 
    UserDetailSerializer # Importa o novo serializer
)

@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            # Adicionado 'name' na resposta do login
            return Response({
                'message': 'Login successful',
                'user': { 
                    'id': user.id, 
                    'username': user.username, 
                    'email': user.email, 
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username 
                },
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# --- VIEW MODIFICADA ---
# Agora aceita GET (para ler) e PUT (para atualizar)
@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Retorna ou atualiza os dados do usuário logado.
    """
    try:
        user = request.user
        # Tenta buscar o perfil, se não existir (usuário antigo), cria um
        profile, created = Profile.objects.get_or_create(user=user)
    except Exception as e:
         return Response({'error': f'Erro ao buscar perfil: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'GET':
        # Retorna os dados completos do usuário e seu perfil
        serializer = UserDetailSerializer(user)
        # Formatamos o 'name' para o frontend
        data = serializer.data
        data['name'] = f"{user.first_name} {user.last_name}".strip() or user.username
        return Response(data)

    elif request.method == 'PUT':
        # O frontend envia um objeto "plano" como {'phone': '123'}
        # Vamos atualizar o User ou o Profile dependendo da chave
        data = request.data
        user_fields = ['email']
        profile_fields = ['phone', 'cpf', 'birth_date', 'gender']
        
        # 'name' é um caso especial, dividimos em first_name e last_name
        if 'name' in data:
            parts = data['name'].split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
        
        for key, value in data.items():
            if key in user_fields:
                setattr(user, key, value)
            if key in profile_fields:
                # Tratamento especial para datas nulas ou strings vazias
                if key == 'birth_date' and not value:
                    value = None
                setattr(profile, key, value)

        user.save()
        profile.save()
        
        serializer = UserDetailSerializer(user)
        # Adicionamos o 'name' formatado na resposta
        response_data = serializer.data
        response_data['name'] = f"{user.first_name} {user.last_name}".strip() or user.username
        return Response(response_data, status=status.HTTP_200_OK)
# --- FIM DA MODIFICAÇÃO ---

class PerfumeList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Perfume.objects.all()
    serializer_class = PerfumeSerializer

class PerfumeDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Perfume.objects.all()
    serializer_class = PerfumeSerializer

class CartDetail(generics.RetrieveUpdateAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    perfume_id = request.data.get('perfume_id')
    quantity = request.data.get('quantity', 1)
    try:
        perfume = Perfume.objects.get(id=perfume_id)
    except Perfume.DoesNotExist:
        return Response({'error': 'Perfume not found'}, status=status.HTTP_404_NOT_FOUND)
    
    cart_item, created = CartItem.objects.get_or_create(cart=cart, perfume=perfume)
    
    if not created:
        cart_item.quantity += int(quantity)
    else:
        cart_item.quantity = int(quantity)
    cart_item.save()
    return Response({'message': 'Item added to cart'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_cart_item(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity', 1)
    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        if int(quantity) <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
        else:
            cart_item.quantity = int(quantity)
            cart_item.save()
            return Response({'message': 'Cart updated'}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    item_id = request.data.get('item_id')
    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
        return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart.items.all().delete()
    return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkout(request):
    cart = Cart.objects.get(user=request.user)
    items = cart.items.all()
    if not items:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    shipping_address_id = request.data.get('shipping_address_id')
    payment_method = request.data.get('payment_method')
    
    if not shipping_address_id or not payment_method:
        return Response({'error': 'shipping_address_id e payment_method são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        address = Address.objects.get(id=shipping_address_id, user=request.user)
        # Formata o endereço para salvar no pedido
        shipping_address_str = f"{address.street}, {address.number}, {address.complement or ''} - {address.neighborhood}, {address.city} - {address.state}, CEP: {address.zip_code}"
    except Address.DoesNotExist:
        return Response({'error': 'Endereço não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    total_amount = sum(item.perfume.price * item.quantity for item in items)
    
    order = Order.objects.create(
        user=request.user, 
        total_amount=total_amount,
        shipping_address=shipping_address_str, 
        payment_method=payment_method
    )
    order.items.set(items)
    
    # Limpa o carrinho
    cart.items.all().delete()
    
    return Response({'message': 'Order created successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED)

class OrderList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class OrderDetail(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class FavoriteList(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request):
    try:
        perfume_id = request.data.get('perfume_id')
        if not perfume_id:
            return Response({'error': 'perfume_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            perfume = Perfume.objects.get(id=perfume_id)
        except Perfume.DoesNotExist:
            return Response({'error': 'Perfume not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            favorite = Favorite.objects.get(user=request.user, perfume=perfume)
            favorite.delete()
            return Response({'message': 'Removed from favorites', 'is_favorite': False}, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            favorite = Favorite.objects.create(user=request.user, perfume=perfume)
            serializer = FavoriteSerializer(favorite)
            return Response({'message': 'Added to favorites', 'is_favorite': True, 'favorite': serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite(request):
    try:
        favorite_id = request.data.get('favorite_id')
        if not favorite_id:
            return Response({'error': 'favorite_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            favorite = Favorite.objects.get(id=favorite_id, user=request.user)
            favorite.delete()
            return Response({'message': 'Removed from favorites'}, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_favorite(request, perfume_id):
    try:
        exists = Favorite.objects.filter(user=request.user, perfume_id=perfume_id).exists()
        return Response({'is_favorite': exists}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddressListCreate(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AddressDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)