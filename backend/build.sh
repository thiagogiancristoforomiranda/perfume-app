#!/bin/bash
set -o errexit
set -x  # ⬅️ MODE DEBUG LIGADO

echo "🚀 INICIANDO DEPLOY - DEBUG MODE"
pwd
ls -la

echo "📦 INSTALANDO DEPENDÊNCIAS..."
pip install -r requirements.txt

echo "🗄️ EXECUTANDO MIGRAÇÕES..."
python manage.py migrate

echo "📁 VERIFICANDO ARQUIVOS..."
ls -la

echo "🎯 EXECUTANDO LOAD_PERFUMES.PY..."
python load_perfumes.py

echo "✅ COLETANDO ARQUIVOS ESTÁTICOS..."
python manage.py collectstatic --noinput

echo "🎉 DEPLOY CONCLUÍDO!"