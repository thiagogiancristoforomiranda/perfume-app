import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def load_perfumes():
    from perfumes.models import Perfume
    
    perfumes = [
        {
            "name": "Invictus",
            "description": "Uma fragrância amadeirada aquática para homens.",
            "price": "350.00",
            "in_stock": True
        },
        {
            "name": "Aqua di Gio Profondo", 
            "description": "Um clássico aromático aquático.",
            "price": "450.00", 
            "in_stock": True
        }
    ]
    
    print("📦 Criando perfumes diretamente no código...")
    
    for data in perfumes:
        perfume, created = Perfume.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"✅ Criado: {perfume.name}")
        else:
            print(f"⚠️  Já existe: {perfume.name}")
    
    print(f"🎉 Total de perfumes no banco: {Perfume.objects.count()}")

if __name__ == '__main__':
    load_perfumes()