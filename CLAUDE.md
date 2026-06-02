# Petoopia — Project Reference (CLAUDE.md)

> This file is the canonical reference for the Petoopia codebase.
> Read it before making any changes so you understand every connection.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, React Router v7, Vite 5               |
| Backend   | Django 5.1, Django REST Framework 3.15          |
| Auth      | djangorestframework-simplejwt (JWT)             |
| Databases | SQLite × 2 (users.db, products.db)              |
| Styling   | Plain CSS with CSS custom properties            |
| Fonts     | Abril Fatface (display), Playfair Display (heading), Outfit (body) |

---

## Running the Project

```bash
# ── Backend (Terminal 1) ──────────────────────────────────────
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt

python manage.py makemigrations products users  # only needed once
python manage.py migrate                        # writes users.db
python manage.py migrate --database=products_db # writes products.db
python manage.py seed_products                  # seeds 12 products
python manage.py createsuperuser               # create admin (use email as username)
python manage.py runserver                     # → http://localhost:8000

# ── Frontend (Terminal 2) ─────────────────────────────────────
cd frontend
npm install
npm run dev                                    # → http://localhost:5173
```

---

## Directory Structure

```
Petoopia_Website/
├── CLAUDE.md                        ← you are here
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── SETUP.md
│   ├── users.db                     ← SQLite: users, auth, cart, wishlist, pets
│   ├── products.db                  ← SQLite: product catalogue
│   ├── db_routers.py                ← routes products app → products_db
│   │
│   ├── petoopia_backend/            ← Django project package
│   │   ├── settings.py              ← DATABASES, INSTALLED_APPS, JWT, CORS
│   │   ├── urls.py                  ← mounts /admin/, /api/products/, /api/users/
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── products/                    ← "products" app → products_db
│   │   ├── models.py                ← Product model (JSONField for highlights/specs)
│   │   ├── serializers.py           ← ProductSerializer, ProductListSerializer
│   │   ├── views.py                 ← ProductViewSet (read-public, write-staff-only)
│   │   ├── urls.py                  ← DefaultRouter → /api/products/
│   │   ├── admin.py                 ← ProductAdmin (using='products_db')
│   │   └── management/commands/
│   │       └── seed_products.py     ← python manage.py seed_products
│   │
│   └── users/                       ← "users" app → default (users.db)
│       ├── models.py                ← UserProfile, Pet, CartItem, WishlistItem
│       ├── serializers.py           ← PetSerializer, CartItemSerializer, WishlistItemSerializer
│       ├── views.py                 ← RegisterView, LoginView, ProfileView,
│       │                               PetsView, PetItemView, CartView, CartItemView,
│       │                               WishlistView, WishlistItemView,
│       │                               ChangePasswordView, AdminStatsView, AdminUsersView
│       ├── urls.py                  ← all /api/users/* paths
│       └── admin.py                 ← UserAdmin + inlines, CartItemAdmin, WishlistItemAdmin
│
└── frontend/
    ├── vite.config.js               ← proxy: /api → http://localhost:8000
    ├── package.json
    └── src/
        ├── main.jsx                 ← ReactDOM.createRoot → <App />
        ├── index.css                ← CSS custom properties (:root), global reset
        ├── App.jsx                  ← BrowserRouter > AuthProvider > Routes
        ├── App.css
        │
        ├── services/
        │   └── api.js               ← fetch wrapper + token helpers + convertProduct()
        │
        ├── context/
        │   └── AuthContext.jsx      ← user state, login(), logout(), register(), refreshUser()
        │
        ├── data/
        │   └── products.js          ← static fallback: bestSellers, newArrivals, allProducts
        │
        ├── components/
        │   ├── Navbar.jsx / .css    ← fixed header, links to /signin /account /wishlist /cart
        │   ├── Hero.jsx / .css      ← auto-rotating carousel (3 slides, 5.5s interval)
        │   ├── CategoryGrid.jsx / .css  ← Dogs / Cats / Birds category cards
        │   ├── FeaturedProducts.jsx / .css  ← Best Sellers + New Arrivals grids
        │   ├── Footer.jsx / .css    ← 4-column footer
        │   ├── VerticalPromo.jsx / .css
        │   └── PromoBanner.jsx / .css
        │
        └── pages/
            ├── SignIn/              ← email + password → POST /api/users/login/
            ├── SignUp/              ← name/email/mobile/password → POST /api/users/register/
            ├── ForgotPassword/      ← email field (no API integration yet)
            ├── ResetPassword/       ← token + new password (no API integration yet)
            ├── Account/             ← 6 tabs; reads /api/users/profile/ + /api/users/pets/
            ├── Cart/                ← reads/writes /api/users/cart/*
            ├── Wishlist/            ← reads/writes /api/users/wishlist/*
            ├── ProductDetail/       ← reads /api/products/:id/ + /api/products/
            └── AdminPanel/          ← staff-only; reads /api/users/admin/* + /api/products/
```

---

## Two Databases

```
users.db  (DATABASES['default'])
├── auth_user              ← Django built-in (username = email)
├── users_userprofile      ← OneToOne → auth_user  (phone)
├── users_pet              ← FK → auth_user  (name, pet_type, breed, age, emoji)
├── users_cartitem         ← FK → auth_user  (product_id¹, product_name, price, qty …)
└── users_wishlistitem     ← FK → auth_user  (product_id¹, product_name, price, original_price …)

products.db  (DATABASES['products_db'])
└── products_product       ← id, name, category, price, original_price, rating, reviews,
                              badge, emoji, in_stock, is_best_seller, is_new_arrival,
                              description, highlights (JSON), specs (JSON)

¹ product_id is an integer, NOT a foreign key.
  Cart/Wishlist items copy the product fields at add-time because Django does not allow
  cross-database foreign keys. The product_id field exists only for reference lookups.
```

**Database Router** (`db_routers.py → ProductsRouter`):
```
app_label == 'products'  →  products_db  (read, write, migrate)
anything else            →  default      (read, write, migrate)
```

---

## API Endpoints

All requests are prefixed `/api/`. The Vite dev-server proxies `/api/*` → `http://localhost:8000`.

### Auth & Users  (`/api/users/`)

| Method | Path                   | View                  | Auth          |
|--------|------------------------|-----------------------|---------------|
| POST   | register/              | RegisterView          | Public        |
| POST   | login/                 | LoginView             | Public        |
| POST   | token/refresh/         | TokenRefreshView      | Public        |
| GET    | profile/               | ProfileView           | Bearer token  |
| PUT    | profile/               | ProfileView           | Bearer token  |
| POST   | change-password/       | ChangePasswordView    | Bearer token  |
| GET    | pets/                  | PetsView              | Bearer token  |
| POST   | pets/                  | PetsView              | Bearer token  |
| PUT    | pets/`<pk>`/           | PetItemView           | Bearer token  |
| DELETE | pets/`<pk>`/           | PetItemView           | Bearer token  |
| GET    | cart/                  | CartView              | Bearer token  |
| POST   | cart/                  | CartView              | Bearer token  |
| DELETE | cart/                  | CartView              | Bearer token  |
| PUT    | cart/`<pk>`/           | CartItemView          | Bearer token  |
| DELETE | cart/`<pk>`/           | CartItemView          | Bearer token  |
| GET    | wishlist/              | WishlistView          | Bearer token  |
| POST   | wishlist/              | WishlistView          | Bearer token  |
| DELETE | wishlist/`<pk>`/       | WishlistItemView      | Bearer token  |
| GET    | admin/stats/           | AdminStatsView        | is_staff      |
| GET    | admin/users/           | AdminUsersView        | is_staff      |

### Products  (`/api/products/`)

| Method | Path          | Description                          | Auth         |
|--------|---------------|--------------------------------------|--------------|
| GET    | /             | List products (supports query params)| Public       |
| POST   | /             | Create product                       | is_staff     |
| GET    | `<id>`/       | Product detail (full fields)         | Public       |
| PUT    | `<id>`/       | Full update                          | is_staff     |
| PATCH  | `<id>`/       | Partial update                       | is_staff     |
| DELETE | `<id>`/       | Delete                               | is_staff     |

**Product list query params:**

| Param            | Example               | Effect                      |
|------------------|-----------------------|-----------------------------|
| `is_best_seller` | `?is_best_seller=true`| Filter best sellers         |
| `is_new_arrival` | `?is_new_arrival=true`| Filter new arrivals         |
| `category`       | `?category=Dogs`      | Filter by category          |
| `in_stock`       | `?in_stock=true`      | Filter in-stock only        |
| `search`         | `?search=kong`        | Case-insensitive name search|

---

## Frontend Routes

Defined in `src/App.jsx`. All routes are wrapped in `<AuthProvider>`.

| Path              | Component        | Layout                | API calls                                      |
|-------------------|------------------|-----------------------|------------------------------------------------|
| `/`               | HomePage         | Navbar + Footer       | `/api/products/?is_best_seller=true`, `?is_new_arrival=true` |
| `/signin`         | SignIn           | Auth card             | `POST /api/users/login/`                       |
| `/signup`         | SignUp           | Auth card             | `POST /api/users/register/`                    |
| `/forgot-password`| ForgotPassword   | Auth card             | —                                              |
| `/reset-password` | ResetPassword    | Auth card             | —                                              |
| `/account`        | Account          | Navbar + Footer       | `GET /api/users/profile/`, `GET /api/users/pets/`, `POST /api/users/change-password/` |
| `/cart`           | Cart             | Navbar + Footer       | `GET /api/users/cart/`, `PUT /api/users/cart/<pk>/`, `DELETE /api/users/cart/<pk>/` |
| `/wishlist`       | Wishlist         | Navbar + Footer       | `GET /api/users/wishlist/`, `DELETE /api/users/wishlist/<pk>/` |
| `/product/:id`    | ProductDetail    | Navbar + Footer       | `GET /api/products/<id>/`, `GET /api/products/` |
| `/admin-panel`    | AdminPanel       | Sidebar layout        | `GET /api/users/admin/stats/`, `GET /api/users/admin/users/`, full `/api/products/` CRUD |

---

## Component Dependency Map

```
main.jsx
└── App.jsx
    ├── AuthProvider (context/AuthContext.jsx)
    │   └── api.js  [setTokens, clearTokens]
    │
    ├── Navbar.jsx              (no API — uses Link)
    ├── Hero.jsx                (no API — local state)
    ├── CategoryGrid.jsx        ← data/products.js [categories]
    │
    ├── FeaturedProducts.jsx    ← data/products.js [static fallback]
    │                           ← api.js [GET /api/products/?is_best_seller=true]
    │                                    [GET /api/products/?is_new_arrival=true]
    │
    ├── VerticalPromo.jsx       (no API)
    ├── PromoBanner.jsx         (no API)
    ├── Footer.jsx              (no API)
    │
    ├── SignIn.jsx              ← useAuth() → login() → POST /api/users/login/
    ├── SignUp.jsx              ← useAuth() → register() → POST /api/users/register/
    ├── ForgotPassword.jsx      (form only, no API)
    ├── ResetPassword.jsx       (form only, no API)
    │
    ├── Account.jsx             ← useAuth() [user, logout]
    │                           ← api.js [GET /api/users/profile/]
    │                                    [GET /api/users/pets/]
    │                                    [POST /api/users/change-password/]
    │
    ├── Cart.jsx                ← useAuth() [user]
    │                           ← api.js [GET /api/users/cart/]
    │                                    [PUT /api/users/cart/<pk>/]
    │                                    [DELETE /api/users/cart/<pk>/]
    │
    ├── Wishlist.jsx            ← useAuth() [user]
    │                           ← api.js [GET /api/users/wishlist/]
    │                                    [DELETE /api/users/wishlist/<pk>/]
    │
    ├── ProductDetail.jsx       ← data/products.js [allProducts, static fallback]
    │                           ← api.js [GET /api/products/<id>/]
    │                                    [GET /api/products/]
    │
    └── AdminPanel.jsx          ← useAuth() [user.is_staff guard]
                                ← api.js [GET /api/users/admin/stats/]
                                         [GET /api/users/admin/users/]
                                         [GET /api/products/]
                                         [POST /api/products/]
                                         [PUT /api/products/<id>/]
                                         [DELETE /api/products/<id>/]
```

---

## Auth Flow

```
1. User submits SignUp form
   → register() in AuthContext
   → POST /api/users/register/
   → Django creates auth_user + UserProfile
   → Redirect to /signin

2. User submits SignIn form
   → login() in AuthContext
   → POST /api/users/login/
   → Django authenticates (username = email), returns JWT pair + user payload
   → Tokens saved to localStorage (petoopia_token, petoopia_refresh, petoopia_user)
   → user state set in AuthContext

3. Every API call (api.js)
   → reads petoopia_token from localStorage
   → injects Authorization: Bearer <token> header

4. Logout
   → logout() clears localStorage, sets user → null
   → redirect to /signin
```

**JWT settings** (`petoopia_backend/settings.py`):
- Access token lifetime: **2 hours**
- Refresh token lifetime: **30 days**
- Rotate refresh tokens: **true**

---

## CSS Design Tokens

Defined once in `frontend/src/index.css` and available globally.

```css
/* Colours */
--black: #0a0a0a          --white: #fafafa
--off-white: #f5f5f3      --gray-50 … --gray-900  (13 stops)
--accent: #e86f00         /* amber — used only for cart badge */

/* Typography */
--font-display: 'Abril Fatface', serif      /* product names, prices, headings */
--font-heading: 'Playfair Display', serif   /* section titles */
--font-body:    'Outfit', sans-serif        /* all body copy */

/* Shape */
--radius-sm: 4px          --radius-md: 8px

/* Shadow */
--shadow-sm:     0 1px 4px rgba(0,0,0,0.06)
--shadow-md:     0 4px 16px rgba(0,0,0,0.10)
--shadow-brutal: 4px 4px 0 0 var(--black)   /* hover effect on cards/buttons */
```

---

## Django Admin

Access at `http://localhost:8000/admin/` with a superuser account.

| Section       | Database     | Notes                                          |
|---------------|--------------|------------------------------------------------|
| Products      | products.db  | Full CRUD; list_editable price, in_stock flags |
| Users         | users.db     | Extended with UserProfile + Pet inlines        |
| Cart Items    | users.db     | Read/filter by user or category                |
| Wishlist Items| users.db     | Read/filter by user or category                |
| Pets          | users.db     | Read/filter by user or pet_type                |

The `ProductAdmin` class uses `using = 'products_db'` and overrides `get_queryset`, `save_model`, `delete_model`, and `delete_queryset` to ensure all operations hit the correct database.

---

## React Admin Panel (`/admin-panel`)

Requires `user.is_staff === true` (redirects to `/signin` otherwise).

| Tab         | Data source                                    | Actions                   |
|-------------|------------------------------------------------|---------------------------|
| Dashboard   | `GET /api/users/admin/stats/`                  | Read-only stat cards      |
| Products    | `GET /api/products/` (all)                     | Add, Edit (modal), Delete |
| Users       | `GET /api/users/admin/users/`                  | Read-only table           |

**Product form fields:** name, category, price, original_price, rating, reviews, badge, emoji, in_stock, is_best_seller, is_new_arrival, description, highlights (one per line → JSON array), specs (raw JSON → dict).

---

## Static Fallback Strategy

FeaturedProducts and ProductDetail both load static data first, then replace with live API data:

```
1. Component mounts with static data/products.js values (instant render, no flash)
2. useEffect fires → fetch from /api/products/
3. On success → swap to live data
4. On failure (backend offline) → static data stays, no error shown to user
```

This means the storefront works without the backend running, just without cart/wishlist/auth features.

---

## Key Conventions

- **snake_case** in Django models/serializers, **camelCase** in React components
- `convertProduct(p)` in `api.js` maps `original_price → originalPrice`, `in_stock → inStock`, etc.
- Cart and Wishlist items **denormalise** product fields (name, price, emoji, category) because products live in a separate database and cross-DB foreign keys are not allowed in Django.
- The `username` field on Django's `auth_user` stores the **email address** (set at registration). This enables standard JWT `authenticate(username=email, password=password)` to work without a custom backend.
- All protected API routes require `Authorization: Bearer <access_token>` header — injected automatically by `api.js`.
- Vite's `server.proxy` forwards `/api/*` to Django during development, so the browser never makes a cross-origin request and CORS is only needed for production deployments.
