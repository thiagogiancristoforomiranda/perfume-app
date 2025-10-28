import os
import django
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def migrate_database():
    """Executa as migrações para o PostgreSQL"""
    print("🔄 Executando migrações do banco de dados...")
    
    # Aplicar migrações
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("✅ Migrações concluídas com sucesso!")

if __name__ == '__main__':
    migrate_database()