from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Perfume, Cart, CartItem, Order, Favorite
from .serializers import (
    UserSerializer, PerfumeSerializer, 
    CartSerializer, CartItemSerializer, 
    OrderSerializer, FavoriteSerializer
)

@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Gerar token JWT automaticamente após registro
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
            # Gerar token JWT
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Retorna os dados do usuário logado
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': f"{user.first_name} {user.last_name}".strip() or user.username
    })

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
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity
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
        
        if quantity <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
        else:
            cart_item.quantity = quantity
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
    
    shipping_address = request.data.get('shipping_address')
    payment_method = request.data.get('payment_method')

    if not shipping_address or not payment_method:
        return Response(
            {'error': 'shipping_address e payment_method são obrigatórios.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    total_amount = sum(item.perfume.price * item.quantity for item in items)

    order = Order.objects.create(
        user=request.user,
        total_amount=total_amount,
        shipping_address=shipping_address,
        payment_method=payment_method
    )
    order.items.set(items)

    # Clear the cart
    cart.items.all().delete()

    return Response({'message': 'Order created successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED)

# Views para Pedidos
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

# Views para Favoritos
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
        
        # Verificar se já existe favorito
        try:
            favorite = Favorite.objects.get(user=request.user, perfume=perfume)
            favorite.delete()
            return Response({
                'message': 'Removed from favorites', 
                'is_favorite': False
            }, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            # Criar novo favorito
            favorite = Favorite.objects.create(user=request.user, perfume=perfume)
            serializer = FavoriteSerializer(favorite)
            return Response({
                'message': 'Added to favorites', 
                'is_favorite': True,
                'favorite': serializer.data
            }, status=status.HTTP_201_CREATED)
            
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