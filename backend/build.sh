#!/bin/bash
set -o errexit

echo "🚀 INICIANDO DEPLOY..."
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

echo "📦 CARREGANDO DADOS..."
python load_perfumes.py

echo "✅ DEPLOY CONCLUÍDO!"