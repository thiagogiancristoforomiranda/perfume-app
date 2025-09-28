from django.contrib import admin
from .models import Perfume, Cart, CartItem, Order # Importando todos os seus modelos

# O Django Admin usará esta linha para criar a interface para o seu modelo
admin.site.register(Perfume)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)