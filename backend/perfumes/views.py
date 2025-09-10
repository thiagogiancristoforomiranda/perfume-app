from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from .models import Perfume, Cart, CartItem, Order
from .serializers import (
    UserSerializer, PerfumeSerializer, 
    CartSerializer, CartItemSerializer, OrderSerializer
)

@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny]) 
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class PerfumeList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Perfume.objects.all()
    serializer_class = PerfumeSerializer

class CartDetail(generics.RetrieveUpdateAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
class PerfumeDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Perfume.objects.all()
    serializer_class = PerfumeSerializer

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
def checkout(request):
    cart = Cart.objects.get(user=request.user)
    items = cart.items.all()
    
    if not items:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    total_amount = sum(item.perfume.price * item.quantity for item in items)
    order = Order.objects.create(
        user=request.user,
        total_amount=total_amount,
        shipping_address=request.data.get('shipping_address'),
        payment_method=request.data.get('payment_method')
    )
    order.items.set(items)
    
    # Clear the cart
    cart.items.all().delete()
    
    return Response({'message': 'Order created successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED)