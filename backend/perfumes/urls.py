from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    # Autenticação
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.user_login, name='login'),
    path('auth/profile/', views.user_profile, name='profile'),
    
    # Perfumes
    path('perfumes/', views.PerfumeList.as_view(), name='perfume-list'),
    path('perfumes/<int:pk>/', views.PerfumeDetail.as_view(), name='perfume-detail'),
    
    # Carrinho
    path('cart/', views.CartDetail.as_view(), name='cart-detail'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/update/', views.update_cart_item, name='update-cart'),
    path('cart/remove/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),
    
    # Pedidos
    path('orders/', views.OrderList.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetail.as_view(), name='order-detail'),
    path('checkout/', views.checkout, name='checkout'),
    
    # Favoritos
    path('favorites/', views.FavoriteList.as_view(), name='favorite-list'),
    path('favorites/toggle/', views.toggle_favorite, name='toggle-favorite'),
    path('favorites/remove/', views.remove_favorite, name='remove-favorite'),
    path('favorites/check/<int:perfume_id>/', views.check_favorite, name='check-favorite'),
]