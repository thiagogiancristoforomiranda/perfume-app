#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Create static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate

# Load initial data if exists
if [ -f "perfumes_final.json" ]; then
    python manage.py loaddata perfumes_final.json
fi

# Create superuser if doesn't exist
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell