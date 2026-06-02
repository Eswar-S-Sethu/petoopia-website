# Petoopia Backend — Setup Guide

## Requirements
- Python 3.11+
- pip

## Quick Start

### 1. Create & activate virtual environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run migrations (creates two SQLite databases)
```bash
# users.db — auth, users, cart, wishlist, pets
python manage.py migrate

# products.db — product catalogue
python manage.py migrate --database=products_db
```

### 4. Seed the product catalogue
```bash
python manage.py seed_products
```

### 5. Create an admin/staff user
```bash
python manage.py createsuperuser
```
Enter your email as both **username** and **email**.
This user will have `is_staff = True` and can access:
- Django Admin at `http://localhost:8000/admin/`
- React Admin Panel at `http://localhost:5173/admin-panel`

### 6. Start the backend server
```bash
python manage.py runserver
```
Backend runs at `http://localhost:8000`

---

## Start the frontend (separate terminal)
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Database layout

| Database     | File          | Contents                              |
|--------------|---------------|---------------------------------------|
| `default`    | `users.db`    | Users, profiles, pets, cart, wishlist |
| `products_db`| `products.db` | Product catalogue                     |

## API Endpoints

| Method | Endpoint                      | Description              | Auth      |
|--------|-------------------------------|--------------------------|-----------|
| POST   | /api/users/register/          | Create account           | Public    |
| POST   | /api/users/login/             | Get JWT tokens + user    | Public    |
| POST   | /api/users/token/refresh/     | Refresh access token     | Public    |
| GET    | /api/users/profile/           | Get profile              | Required  |
| PUT    | /api/users/profile/           | Update profile           | Required  |
| POST   | /api/users/change-password/   | Change password          | Required  |
| GET    | /api/users/pets/              | List pets                | Required  |
| POST   | /api/users/pets/              | Add pet                  | Required  |
| PUT    | /api/users/pets/{id}/         | Update pet               | Required  |
| DELETE | /api/users/pets/{id}/         | Delete pet               | Required  |
| GET    | /api/users/cart/              | Get cart items           | Required  |
| POST   | /api/users/cart/              | Add item to cart         | Required  |
| PUT    | /api/users/cart/{id}/         | Update cart item qty     | Required  |
| DELETE | /api/users/cart/{id}/         | Remove cart item         | Required  |
| GET    | /api/users/wishlist/          | Get wishlist             | Required  |
| POST   | /api/users/wishlist/          | Add to wishlist          | Required  |
| DELETE | /api/users/wishlist/{id}/     | Remove from wishlist     | Required  |
| GET    | /api/users/admin/stats/       | Dashboard stats          | Staff     |
| GET    | /api/users/admin/users/       | List all users           | Staff     |
| GET    | /api/products/                | List products            | Public    |
| POST   | /api/products/                | Create product           | Staff     |
| GET    | /api/products/{id}/           | Product detail           | Public    |
| PUT    | /api/products/{id}/           | Update product           | Staff     |
| DELETE | /api/products/{id}/           | Delete product           | Staff     |

### Product query params
- `?is_best_seller=true` — filter best sellers
- `?is_new_arrival=true` — filter new arrivals
- `?category=Dogs` — filter by category
- `?search=kong` — name search

## Admin interfaces

| Interface         | URL                                    | Who        |
|-------------------|----------------------------------------|------------|
| Django Admin      | http://localhost:8000/admin/           | Staff user |
| React Admin Panel | http://localhost:5173/admin-panel      | Staff user |

The React Admin Panel gives you:
- **Dashboard** — live stats (products, users, cart/wishlist counts)
- **Products** — table view, search, add new product, edit, delete
- **Users** — table view with cart/wishlist counts

The Django Admin gives you full database-level access to all models in both databases.
