#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py makemigrations products users
python manage.py migrate
python manage.py migrate --database=products_db

# Create superuser from env vars if it doesn't already exist
# Set ADMIN_EMAIL, ADMIN_PASSWORD (and optionally ADMIN_NAME) in Render environment variables.
python manage.py shell -c "
import os
from django.contrib.auth.models import User
email    = os.environ.get('ADMIN_EMAIL', '')
password = os.environ.get('ADMIN_PASSWORD', '')
name     = os.environ.get('ADMIN_NAME', 'Admin')
if email and password:
    if User.objects.filter(username=email).exists():
        u = User.objects.get(username=email)
        u.is_staff = True
        u.is_superuser = True
        u.set_password(password)
        u.save()
        print(f'Existing user {email} promoted to superuser.')
    else:
        parts = name.split(' ', 1)
        User.objects.create_superuser(
            username=email, email=email, password=password,
            first_name=parts[0], last_name=parts[1] if len(parts) > 1 else ''
        )
        print(f'Superuser {email} created.')
else:
    print('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping superuser creation.')
"

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
