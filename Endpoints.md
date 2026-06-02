# Petoopia API — Endpoint Reference

---

## Mobile / Network Setup

### Base URLs

| Environment | Base URL |
|---|---|
| Web (same machine) | `http://localhost:8000/api` |
| **Mobile / LAN** | **`http://172.20.10.2:8000/api`** |
| Production | `https://your-domain.com/api` *(to be configured)* |

The mobile base URL uses the PC's local IP address. The phone and the PC must be on the **same Wi-Fi network**. For production replace with a real domain over HTTPS.

### Starting the server for mobile access

```bash
# Standard (web only — localhost:8000)
python manage.py runserver

# Mobile-accessible (all network interfaces — required for phones/emulators)
python manage.py runserver 0.0.0.0:8000
```

Without `0.0.0.0`, Django only listens on `127.0.0.1` (loopback) and is unreachable from any other device. With `0.0.0.0` it binds to all interfaces so phones, tablets, and emulators on the same network can connect.

### What is already configured for mobile

| Feature | Status | Notes |
|---|---|---|
| `ALLOWED_HOSTS` | `['*']` | Accepts requests from any host/IP |
| CORS | `CORS_ALLOW_ALL_ORIGINS = True` | Allows all origins — covers native apps, Expo web, and webviews |
| JWT authentication | Enabled | Stateless — no cookies or sessions needed |
| CSRF | Not required | All protected endpoints use `Authorization: Bearer` header |
| JSON responses | Always | No HTML error pages |
| Refresh token rotation | Enabled | New refresh token issued on every refresh call |
| Public product endpoints | No auth needed | `/api/products/` and `/api/products/{id}/` work without a token |

### CORS note for mobile developers

Native mobile apps (iOS Swift/Kotlin, React Native, Flutter) **do not enforce CORS** — they never send an `Origin` header, so CORS headers are irrelevant for them. CORS only matters for browser-based contexts such as Expo web or in-app WebViews. Either way, the server is configured to allow all origins.

### Production checklist (before going live)

```python
# settings.py changes for production:

DEBUG = False

ALLOWED_HOSTS = ['api.yourdomain.com']   # your real domain only

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
]

SECRET_KEY = '<generate a new random key>'  # never reuse the dev key
```

Generate a new secret key with:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Authentication & Token Management

All request and response bodies are JSON.
Protected endpoints require the header:
```
Authorization: Bearer <access_token>
```

### Token lifetimes

| Token | Lifespan | Notes |
|---|---|---|
| Access token | 2 hours | Send in `Authorization` header on every request |
| Refresh token | 30 days | Use to get a new access token; a new refresh token is also issued each time (rotation) |

### Secure token storage (mobile)

| Platform | Recommended storage |
|---|---|
| iOS (Swift/Obj-C) | Keychain Services |
| Android (Kotlin/Java) | EncryptedSharedPreferences |
| React Native | `react-native-keychain` or Expo SecureStore |
| Flutter | `flutter_secure_storage` |

Never store tokens in plain SharedPreferences, AsyncStorage (unencrypted), or UserDefaults.

### Refresh flow implementation

1. Make any API request with the stored access token.
2. If the response is `401 Unauthorized`, call `POST /api/users/token/refresh/` with the stored refresh token.
3. Store the new access token (and new refresh token if returned).
4. Retry the original failed request with the new access token.
5. If the refresh call also returns `401`, clear both tokens and redirect the user to the login screen.

```
Request → 401 → POST /token/refresh/ → new tokens → retry request
                       ↓ 401
                  Clear tokens + go to login
```

---

## Authentication

### Register
```
POST /users/register/
```
Creates a new customer account.

**Request body**
```json
{
  "name":     "John Smith",
  "email":    "john@example.com",
  "mobile":   "0400000000",
  "password": "securepassword"
}
```
**Response `201`**
```json
{ "detail": "Account created successfully." }
```
**Errors**
| Status | Reason |
|--------|--------|
| 400 | Missing name/email/password |
| 400 | `{ "email": "An account with this email already exists." }` |

---

### Login
```
POST /users/login/
```
Returns JWT access + refresh tokens and a user payload.

**Request body**
```json
{
  "email":    "john@example.com",
  "password": "securepassword"
}
```
**Response `200`**
```json
{
  "access":  "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user": {
    "id":           1,
    "name":         "John Smith",
    "email":        "john@example.com",
    "is_staff":     false,
    "phone":        "0400000000",
    "member_since": "May 2026"
  }
}
```
**Errors**
| Status | Reason |
|--------|--------|
| 400 | `{ "detail": "Incorrect email or password." }` |

**Notes**
- Access token expires in **2 hours**.
- Refresh token expires in **30 days**.
- Store both tokens securely (Keychain / EncryptedSharedPreferences on mobile).

---

### Refresh Access Token
```
POST /users/token/refresh/
```
Exchange a valid refresh token for a new access token.

**Request body**
```json
{ "refresh": "<JWT refresh token>" }
```
**Response `200`**
```json
{ "access": "<new JWT access token>" }
```
**Errors**
| Status | Reason |
|--------|--------|
| 400 | Refresh token missing |
| 401 | Invalid or expired refresh token |

---

## User Profile

### Get Profile
```
GET /users/profile/
Auth: Required
```
**Response `200`**
```json
{
  "id":           1,
  "name":         "John Smith",
  "email":        "john@example.com",
  "is_staff":     false,
  "phone":        "0400000000",
  "member_since": "May 2026"
}
```

---

### Update Profile
```
PUT /users/profile/
Auth: Required
```
Only the fields you provide are updated.

**Request body** (all optional)
```json
{
  "name":  "John Smith Jr.",
  "phone": "0411111111"
}
```
**Response `200`** — same shape as Get Profile.

---

### Change Password
```
POST /users/change-password/
Auth: Required
```
**Request body**
```json
{
  "current_password": "oldpassword",
  "new_password":     "newpassword123"
}
```
**Response `200`**
```json
{ "detail": "Password updated successfully." }
```
**Errors**
| Status | Reason |
|--------|--------|
| 400 | Current password incorrect |
| 400 | New password shorter than 8 characters |

---

## Pets

### List Pets
```
GET /users/pets/
Auth: Required
```
**Response `200`**
```json
[
  {
    "id":         1,
    "name":       "Buddy",
    "pet_type":   "Dogs",
    "breed":      "Labrador",
    "age":        "2 years",
    "emoji":      "🐶",
    "created_at": "2026-05-01T10:00:00Z"
  }
]
```

---

### Add Pet
```
POST /users/pets/
Auth: Required
```
**Request body**
```json
{
  "name":  "Buddy",
  "type":  "Dogs",
  "breed": "Labrador",
  "age":   "2 years"
}
```
`type` accepted values: `Dogs`, `Cats`, `Birds`, `Fish`, `Reptiles`, `Small Pets`
`emoji` is set automatically based on `type`.

**Response `201`** — same shape as a single item from List Pets.

---

### Update Pet
```
PUT /users/pets/{id}/
Auth: Required
```
**Request body** — same fields as Add Pet (all optional).
**Response `200`** — updated pet object.
**Errors:** 404 if pet not found or does not belong to the user.

---

### Delete Pet
```
DELETE /users/pets/{id}/
Auth: Required
```
**Response `204 No Content`**
**Errors:** 404 if not found.

---

## Cart

### Get Cart
```
GET /users/cart/
Auth: Required
```
**Response `200`**
```json
[
  {
    "id":               1,
    "product_id":       5,
    "product_name":     "Pedigree Adult Dry Dog Food",
    "product_price":    "49.99",
    "product_emoji":    "🐶",
    "product_category": "Dogs",
    "quantity":         2,
    "created_at":       "2026-05-27T08:00:00Z"
  }
]
```

---

### Add Item to Cart
```
POST /users/cart/
Auth: Required
```
If the product already exists in the cart, `quantity` is incremented.

**Request body**
```json
{
  "product_id":       5,
  "product_name":     "Pedigree Adult Dry Dog Food",
  "product_price":    49.99,
  "product_emoji":    "🐶",
  "product_category": "Dogs",
  "quantity":         1
}
```
**Response `201`** (new item) or **`200`** (qty incremented) — same shape as a cart item.
**Errors:** 400 if `product_id` is missing.

---

### Update Cart Item Quantity
```
PUT /users/cart/{id}/
Auth: Required
```
`{id}` is the **CartItem ID** (not the product ID).

**Request body**
```json
{ "quantity": 3 }
```
If `quantity` < 1 the item is deleted and `204` is returned.
**Response `200`** — updated cart item, or `204` if deleted.

---

### Remove Cart Item
```
DELETE /users/cart/{id}/
Auth: Required
```
`{id}` is the **CartItem ID**.
**Response `204 No Content`**

---

### Clear Entire Cart
```
DELETE /users/cart/
Auth: Required
```
Removes all items for the authenticated user.
**Response `204 No Content`**

---

## Wishlist

### Get Wishlist
```
GET /users/wishlist/
Auth: Required
```
**Response `200`**
```json
[
  {
    "id":                    1,
    "product_id":            3,
    "product_name":          "Royal Canin Indoor Cat Food",
    "product_price":         "59.99",
    "product_original_price":"79.99",
    "product_emoji":         "🐱",
    "product_category":      "Cats",
    "in_stock":              true,
    "discount_pct":          25,
    "created_at":            "2026-05-27T08:00:00Z"
  }
]
```

---

### Add to Wishlist
```
POST /users/wishlist/
Auth: Required
```
**Request body**
```json
{
  "product_id":             3,
  "product_name":           "Royal Canin Indoor Cat Food",
  "product_price":          59.99,
  "product_original_price": 79.99,
  "product_emoji":          "🐱",
  "product_category":       "Cats",
  "in_stock":               true
}
```
**Response `201`** — wishlist item object.
**Errors**
| Status | Reason |
|--------|--------|
| 400 | `product_id` missing |
| 400 | `{ "detail": "Already in wishlist." }` |

---

### Remove from Wishlist
```
DELETE /users/wishlist/{id}/
Auth: Required
```
`{id}` is the **WishlistItem ID** (returned in the list).
**Response `204 No Content`**
**Errors:** 404 if not found.

---

## Products

All product endpoints are public (read). Write operations require a staff account.

### List Products
```
GET /products/
Auth: None
```

**Query parameters**

| Parameter        | Type    | Example                        | Description                     |
|------------------|---------|--------------------------------|---------------------------------|
| `category`       | string  | `?category=Dogs`               | Filter by category              |
| `is_best_seller` | bool    | `?is_best_seller=true`         | Best sellers only               |
| `is_new_arrival` | bool    | `?is_new_arrival=true`         | New arrivals only               |
| `in_stock`       | bool    | `?in_stock=true`               | In-stock products only          |
| `search`         | string  | `?search=pedigree`             | Name contains (case-insensitive)|

**Response `200`** — array of lightweight product objects:
```json
[
  {
    "id":            1,
    "name":          "Pedigree Adult Dry Dog Food",
    "category":      "Dogs",
    "price":         "49.99",
    "original_price":"69.99",
    "rating":        4.5,
    "reviews":       2847,
    "badge":         "Best Seller",
    "emoji":         "🐶",
    "in_stock":      true,
    "is_best_seller":true,
    "is_new_arrival":false,
    "discount_pct":  29
  }
]
```

---

### Get Product Detail
```
GET /products/{id}/
Auth: None
```
**Response `200`** — full product object including description, highlights, and specs:
```json
{
  "id":            1,
  "name":          "Pedigree Adult Dry Dog Food",
  "category":      "Dogs",
  "price":         "49.99",
  "original_price":"69.99",
  "rating":        4.5,
  "reviews":       2847,
  "badge":         "Best Seller",
  "emoji":         "🐶",
  "in_stock":      true,
  "is_best_seller":true,
  "is_new_arrival":false,
  "discount_pct":  29,
  "description":   "Full product description…",
  "highlights":    ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "specs": {
    "Weight":    "15 kg",
    "Life Stage":"Adult",
    "Flavour":   "Chicken"
  }
}
```
**Errors:** 404 if not found.

---

### Create Product
```
POST /products/
Auth: Staff required
```
**Request body**
```json
{
  "name":          "New Product Name",
  "category":      "Dogs",
  "price":         49.99,
  "original_price":69.99,
  "rating":        4.2,
  "reviews":       0,
  "badge":         "New",
  "emoji":         "🦴",
  "in_stock":      true,
  "is_best_seller":false,
  "is_new_arrival":true,
  "description":   "Product description…",
  "highlights":    ["Feature 1", "Feature 2"],
  "specs":         { "Weight": "500g" }
}
```
**Response `201`** — full product object.

---

### Update Product
```
PUT /products/{id}/
Auth: Staff required
```
**Request body** — same fields as Create (all required for PUT, use PATCH for partial).

**Response `200`** — updated product object.

---

### Delete Product
```
DELETE /products/{id}/
Auth: Staff required
```
**Response `204 No Content`**

---

## Admin Endpoints

Both endpoints require the user to have `is_staff = true`.

### Dashboard Stats
```
GET /users/admin/stats/
Auth: Staff required
```
**Response `200`**
```json
{
  "total_products": 12,
  "in_stock":        11,
  "out_of_stock":    1,
  "total_users":     5,
  "cart_items":      8,
  "wishlist_items":  14
}
```

---

### List All Users
```
GET /users/admin/users/
Auth: Staff required
```
**Response `200`**
```json
[
  {
    "id":             1,
    "name":           "John Smith",
    "email":          "john@example.com",
    "phone":          "0400000000",
    "is_staff":       false,
    "is_active":      true,
    "date_joined":    "27 May 2026",
    "cart_count":     3,
    "wishlist_count": 5
  }
]
```

---

## Error Response Format

All error responses follow this shape:
```json
{ "detail": "Human-readable error message." }
```
Field-level validation errors use the field name as the key:
```json
{ "email": "An account with this email already exists." }
```

---

---

## Data Types Reference

| Field               | Type           | Notes |
|---------------------|----------------|-------|
| `price`             | decimal string | e.g. `"49.99"` — parse with `parseFloat()` |
| `original_price`    | decimal string | Same |
| `rating`            | float          | 0.0 – 5.0 |
| `reviews`           | integer        | Review count |
| `in_stock`          | boolean        |  |
| `is_best_seller`    | boolean        |  |
| `is_new_arrival`    | boolean        |  |
| `discount_pct`      | integer        | Computed field, read-only |
| `highlights`        | array[string]  | Up to 4 bullet points |
| `specs`             | object         | Key–value pairs |
| `created_at`        | ISO 8601 string| UTC |
