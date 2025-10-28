import os
import django
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def load_perfumes():
    from perfumes.models import Perfume
    
    print("🎯 INICIANDO CARREGAMENTO DE PERFUMES...")
    
    # Dados dos perfumes DIRETO no código
    perfumes_data = [
        {
            "name": "Invictus",
            "description": "Uma fragrância amadeirada aquática para homens.",
            "price": 350.00,
            "in_stock": True
        },
        {
            "name": "Aqua di Gio Profondo", 
            "description": "Um clássico aromático aquático.",
            "price": 450.00, 
            "in_stock": True
        }
    ]
    
    count = 0
    for data in perfumes_data:
        # Remove perfumes existentes com mesmo nome
        Perfume.objects.filter(name=data['name']).delete()
        
        # Cria novo perfume
        perfume = Perfume.objects.create(**data)
        print(f"✅ CRIADO: {perfume.name} - R$ {perfume.price}")
        count += 1
    
    total = Perfume.objects.count()
    print(f"🎉 CARREGAMENTO CONCLUÍDO! Total no banco: {total} perfumes")
    
    return count

if __name__ == '__main__':
    load_perfumes()