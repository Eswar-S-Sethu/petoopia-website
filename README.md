# Petoopia

A pet supplies e-commerce storefront built with React + Django REST Framework.

**Stack:** React 18, React Router v7, Vite 5, Django 5.1, DRF 3.15, JWT auth, SQLite × 2

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Local Development

Two terminals are required — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations (only needed the first time, or after model changes)
python manage.py makemigrations products users
python manage.py migrate
python manage.py migrate --database=products_db

# Seed the product catalogue (only needed the first time)
python manage.py seed_products

# Create an admin account
python manage.py createsuperuser   # use your email as the username

# Start the development server
python manage.py runserver
# → http://localhost:8000
# → Django admin at http://localhost:8000/admin/
```

### Terminal 2 — Frontend

```bash
cd frontend

npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so no CORS configuration is needed locally.

---

## Environment Variables

### Backend (`.env` inside `backend/`)

Create `backend/.env` for local overrides. All keys are optional locally — the defaults work out of the box.

```env
# Required in production, optional locally
SECRET_KEY=replace-with-a-long-random-string
DEBUG=True

# Comma-separated; leave blank locally to allow all hosts
ALLOWED_HOSTS=

# Comma-separated frontend origins; leave blank locally to allow all
CORS_ALLOWED_ORIGINS=

# Paths to SQLite files; leave blank to use the defaults next to manage.py
USERS_DB_PATH=
PRODUCTS_DB_PATH=
```

### Frontend (`.env.local` inside `frontend/`)

```env
# Leave blank locally — Vite proxy handles /api/* automatically.
# Set to your Render URL in production.
VITE_API_URL=
```

---

## Project Structure

```
Petoopia_Website/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh                  ← Render build script
│   ├── db_routers.py
│   ├── users.db                  ← created by migrate
│   ├── products.db               ← created by migrate + seed_products
│   ├── petoopia_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── products/                 ← product catalogue app (products_db)
│   └── users/                    ← auth, cart, wishlist, pets app (users.db)
│
└── frontend/
    ├── public/
    │   └── _redirects            ← Render Static Site SPA routing
    ├── src/
    │   ├── App.jsx
    │   ├── services/api.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   └── pages/
    └── vite.config.js
```

---

## API Overview

Base URL (local): `http://localhost:8000/api`

### Auth & Users — `/api/users/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `register/` | Public | Create account |
| POST | `login/` | Public | Returns JWT pair |
| POST | `token/refresh/` | Public | Refresh access token |
| GET / PUT | `profile/` | Bearer | View or update profile |
| POST | `change-password/` | Bearer | Change password |
| GET / POST | `pets/` | Bearer | List or add pets |
| PUT / DELETE | `pets/<pk>/` | Bearer | Update or delete a pet |
| GET / POST / DELETE | `cart/` | Bearer | Cart operations |
| PUT / DELETE | `cart/<pk>/` | Bearer | Update or remove cart item |
| GET / POST | `wishlist/` | Bearer | Wishlist operations |
| DELETE | `wishlist/<pk>/` | Bearer | Remove wishlist item |
| GET | `admin/stats/` | is_staff | Dashboard stats |
| GET | `admin/users/` | is_staff | All users list |

### Products — `/api/products/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List products |
| GET | `<id>/` | Public | Product detail |
| POST | `/` | is_staff | Create product |
| PUT / PATCH | `<id>/` | is_staff | Update product |
| DELETE | `<id>/` | is_staff | Delete product |

**List query params:** `?is_best_seller=true`, `?is_new_arrival=true`, `?category=Dogs`, `?in_stock=true`, `?search=kong`

---

## Two Databases

| Database | File | Tables |
|----------|------|--------|
| `default` | `users.db` | auth_user, userprofile, pet, cartitem, wishlistitem |
| `products_db` | `products.db` | product |

Django does not support cross-database foreign keys, so cart and wishlist items copy product fields (name, price, emoji, category) at the time they are added.

---

## Frontend Routes

| Path | Page | Requires auth |
|------|------|---------------|
| `/` | Home | No |
| `/signin` | Sign In | No |
| `/signup` | Sign Up | No |
| `/forgot-password` | Forgot Password | No |
| `/reset-password` | Reset Password | No |
| `/product/:id` | Product Detail | No |
| `/cart` | Cart | Yes |
| `/wishlist` | Wishlist | Yes |
| `/account` | Account (6 tabs) | Yes |
| `/admin-panel` | Admin Panel | is_staff only |

---

## Production Deployment

Both services are hosted on [Render](https://render.com). Deploy the backend first so you have its URL ready when configuring the frontend.

---

### Step 1 — Backend (Render Web Service)

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repo.
3. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `bash build.sh` |
   | Start Command | `gunicorn petoopia_backend.wsgi:application` |

4. Under **Environment**, add these variables:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | A long random string — generate one at [djecrety.ir](https://djecrety.ir) |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `your-backend.onrender.com` *(Render shows you this URL before you deploy)* |
   | `CORS_ALLOWED_ORIGINS` | *(leave blank for now — fill in after Step 2)* |

5. Click **Create Web Service** and wait for the build to finish.

6. Once deployed, open the **Shell** tab in the Render dashboard and create your superuser:
   ```bash
   python manage.py createsuperuser
   ```

> **SQLite persistence:** Render's free tier resets the filesystem on every redeploy. Products are re-seeded automatically by `build.sh`. User accounts are lost on each redeploy unless you add a **Render Disk** (paid, ~$7/mo) mounted at `/var/data` and set `USERS_DB_PATH=/var/data/users.db` and `PRODUCTS_DB_PATH=/var/data/products.db`.

---

### Step 2 — Frontend (Render Static Site)

1. Go to Render → **New → Static Site**.
2. Connect the same GitHub repo.
3. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | Root Directory | `frontend` |
   | Build Command | `npm install && npm run build` |
   | Publish Directory | `dist` |

4. Under **Environment**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |

5. Click **Create Static Site** and wait for the build.

> The `public/_redirects` file (`/* /index.html 200`) is already in the repo. Render picks it up automatically and handles React Router deep links correctly.

---

### Step 3 — Connect them together

1. Copy your frontend URL from the Render Static Site dashboard (e.g. `https://petoopia.onrender.com`).
2. Go back to the **backend** Web Service → **Environment**.
3. Set `CORS_ALLOWED_ORIGINS` to that URL:

   | Key | Value |
   |-----|-------|
   | `CORS_ALLOWED_ORIGINS` | `https://petoopia.onrender.com` |

4. Click **Save Changes** — Render will trigger a redeploy automatically.

---

## Django Admin

Available at `/admin/` with a superuser account.

| Section | Database |
|---------|----------|
| Products | products.db |
| Users + Profiles + Pets | users.db |
| Cart Items | users.db |
| Wishlist Items | users.db |

---

## Useful Commands

```bash
# Re-seed products (clears existing products first)
python manage.py seed_products

# Open Django shell
python manage.py shell

# Check which migrations are pending
python manage.py showmigrations
python manage.py showmigrations --database=products_db

# Frontend production preview
cd frontend && npm run build && npm run preview
```
