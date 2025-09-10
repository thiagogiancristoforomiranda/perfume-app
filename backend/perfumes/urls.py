from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.user_login, name='login'),
    path('perfumes/', views.PerfumeList.as_view(), name='perfume-list'),
    path('cart/', views.CartDetail.as_view(), name='cart-detail'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('checkout/', views.checkout, name='checkout'),
]