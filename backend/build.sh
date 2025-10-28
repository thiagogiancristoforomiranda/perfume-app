#!/bin/bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
python load_perfumes.py

# ⬇️ CARREGA DADOS AUTOMATICAMENTE SE O ARQUIVO EXISTIR
if [ -f "perfumes_data.json" ]; then
    echo "📦 Carregando dados dos perfumes..."
    python manage.py loaddata perfumes_data.json
    echo "✅ Dados carregados com sucesso!"
fi