import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from perfumes.models import Perfume

def create_sample_perfumes():
    perfumes = [
        {
            'name': 'Leão Classic',
            'description': 'Um clássico atemporal com notas amadeiradas e cítricas',
            'price': 199.90,
            'in_stock': True
        },
        {
            'name': 'Leão Premium', 
            'description': 'Fragrância sofisticada com notas florais e especiarias',
            'price': 299.90,
            'in_stock': True
        },
        {
            'name': 'Leão Fresh',
            'description': 'Perfume refrescante ideal para o dia a dia',
            'price': 159.90,
            'in_stock': True
        }
    ]
    
    for perfume_data in perfumes:
        perfume, created = Perfume.objects.get_or_create(
            name=perfume_data['name'],
            defaults=perfume_data
        )
        if created:
            print(f'✅ Perfume criado: {perfume.name}')
        else:
            print(f'📦 Perfume já existe: {perfume.name}')

if __name__ == '__main__':
    print("Criando perfumes de exemplo...")
    create_sample_perfumes()
    print("Concluído!")