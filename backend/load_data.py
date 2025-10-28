import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def load_perfumes_data(json_file_path):
    """Carrega dados de perfumes do arquivo JSON"""
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        print(f"📦 Carregando dados de {json_file_path}...")
        
        from perfumes.models import Perfume
        
        count = 0
        for item in data:
            # Cria o perfume - ajuste os campos conforme seu JSON
            perfume = Perfume(
                name=item.get('name', 'Perfume Sem Nome'),
                description=item.get('description', ''),
                price=item.get('price', 0),
                in_stock=item.get('in_stock', True)
            )
            perfume.save()
            count += 1
        
        print(f"✅ {count} perfumes carregados com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao carregar dados: {e}")

if __name__ == '__main__':
    # Quando tiver o JSON, coloque na pasta backend também
    json_file = "perfumes_data.json"
    if os.path.exists(json_file):
        load_perfumes_data(json_file)
    else:
        print("📝 Arquivo JSON não encontrado. Execute as migrações primeiro.")
        print("💡 Dica: Coloque o arquivo 'perfumes_data.json' na pasta backend")