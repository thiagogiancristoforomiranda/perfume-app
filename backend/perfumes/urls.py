from django.urls import path
from . import views

urlpatterns = [
    # Autenticação
    path('register/', views.register_user, name='register'),
    path('login/', views.user_login, name='login'),
    path('profile/', views.user_profile, name='user-profile'),
    
    # Perfumes - ✅ Agora acessíveis sem autenticação
    path('perfumes/', views.PerfumeList.as_view(), name='perfume-list'),
    path('perfumes/<int:pk>/', views.PerfumeDetail.as_view(), name='perfume-detail'),
    
    # Carrinho
    path('cart/', views.CartDetail.as_view(), name='cart-detail'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/update/', views.update_cart_item, name='update-cart-item'),
    path('cart/remove/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),
    path('checkout/', views.checkout, name='checkout'),
    
    # Pedidos
    path('orders/', views.OrderList.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetail.as_view(), name='order-detail'),
    
    # Favoritos
    path('favorites/', views.FavoriteList.as_view(), name='favorite-list'),
    path('favorites/toggle/', views.toggle_favorite, name='toggle-favorite'),
    path('favorites/remove/', views.remove_favorite, name='remove-favorite'),
    path('favorites/check/<int:perfume_id>/', views.check_favorite, name='check-favorite'),
]