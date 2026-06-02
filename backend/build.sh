#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py makemigrations products users
python manage.py migrate
python manage.py migrate --database=products_db

# Seed products only when the table is empty (safe on re-deploys)
python manage.py shell -c "
from products.models import Product
if not Product.objects.using('products_db').exists():
    from django.core.management import call_command
    call_command('seed_products')
    print('Products seeded.')
else:
    print('Products already exist — skipping seed.')
"
