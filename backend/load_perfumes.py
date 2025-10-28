import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    django.setup()
    print("✅ Django configurado com sucesso!")
    
    from perfumes.models import Perfume
    
    print("🎯 INICIANDO CARREGAMENTO DE PERFUMES...")
    print(f"📊 Perfumes no banco ANTES: {Perfume.objects.count()}")
    
    # Dados dos perfumes
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
        # Remove existente e cria novo
        Perfume.objects.filter(name=data['name']).delete()
        perfume = Perfume.objects.create(**data)
        print(f"✅ CRIADO: {perfume.name} - R$ {perfume.price}")
        count += 1
    
    total = Perfume.objects.count()
    print(f"🎉 CARREGAMENTO CONCLUÍDO!")
    print(f"📊 Perfumes criados: {count}")
    print(f"📊 Total no banco: {total}")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)