# Petoopia — API Reference for iOS

This file is the authoritative reference for every backend endpoint.
All shapes are taken directly from the Django views, serializers, and models.

---

## Base URL

```
Production:  https://petoopia-web-service.onrender.com/api
Local dev:   http://localhost:8000/api
```

Every path below is relative to this base. **All URLs require a trailing slash.**

---

## iOS-Specific Notes

- **No CORS handling needed.** CORS is browser-only; URLSession/Alamofire requests go through without an `Origin` header.
- **Store tokens in Keychain**, not UserDefaults.
- **Content-Type header** must be `application/json` on every request that sends a body.
- **Authorization header** format: `Authorization: Bearer <access_token>`
- **Decimal fields** (`price`, `original_price`, `product_price`, `product_original_price`) are returned as **strings** by Django REST Framework (e.g. `"29.99"`). Parse with `Decimal(string)` or `Double(string)`.
- **Token rotation:** every `/users/token/refresh/` call issues a new access token. The refresh token itself does not rotate — keep using the same one until it expires (30 days).
- **Token lifetimes:** access = 2 hours, refresh = 30 days.
- **Silent refresh pattern:** on any 401, attempt one token refresh and retry the original request. If the refresh also fails, clear tokens and navigate to login.

---

## Error Format

All errors return JSON. Most use a `detail` key; field-level validation errors use the field name as the key.

```json
{ "detail": "Incorrect email or password." }

{ "email": "An account with this email already exists." }
```

HTTP status codes used: `200`, `201`, `204` (no body), `400`, `401`, `403`, `404`.

---

## Authentication

### POST `/users/register/`

Creates a new user account. No auth required.

**Request body**
```json
{
  "name":     "Jane Smith",
  "email":    "jane@example.com",
  "password": "secret123",
  "mobile":   "0412345678"
}
```

`mobile` is optional. `name` is split on the first space into `first_name` / `last_name`.

**Response `201`**
```json
{ "detail": "Account created successfully." }
```

**Errors `400`**
```json
{ "detail": "Name, email, and password are required." }
{ "email":  "An account with this email already exists." }
```

---

### POST `/users/login/`

Returns a JWT pair and the user object. No auth required.

**Request body**
```json
{
  "email":    "jane@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "access":  "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user": {
    "id":           1,
    "name":         "Jane Smith",
    "email":        "jane@example.com",
    "is_staff":     false,
    "phone":        "0412345678",
    "member_since": "June 2024"
  }
}
```

`member_since` is a formatted string `"Month YYYY"`.

**Error `400`**
```json
{ "detail": "Incorrect email or password." }
```

---

### POST `/users/token/refresh/`

Issues a new access token. No auth required.

**Request body**
```json
{ "refresh": "<saved refresh token>" }
```

**Response `200`**
```json
{ "access": "<new JWT access token>" }
```

The refresh token itself is not rotated — keep using the same refresh token.

**Error `401`**
```json
{ "detail": "Invalid or expired refresh token." }
```

---

## Profile

All profile endpoints require `Authorization: Bearer <access_token>`.

---

### GET `/users/profile/`

**Response `200`**
```json
{
  "id":           1,
  "name":         "Jane Smith",
  "email":        "jane@example.com",
  "is_staff":     false,
  "phone":        "0412345678",
  "member_since": "June 2024"
}
```

---

### PUT `/users/profile/`

Send only the fields you want to change. Both are optional.

**Request body**
```json
{
  "name":  "Jane Doe",
  "phone": "0499999999"
}
```

**Response `200`** — same shape as GET profile

---

### POST `/users/change-password/`

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

**Errors `400`**
```json
{ "detail": "Incorrect current password." }
{ "detail": "New password must be at least 8 characters." }
```

---

## Pets

All pet endpoints require `Authorization: Bearer <access_token>`.

---

### GET `/users/pets/`

Returns all pets for the authenticated user, ordered by `created_at` ascending.

**Response `200`**
```json
[
  {
    "id":         1,
    "name":       "Buddy",
    "pet_type":   "Dogs",
    "breed":      "Labrador",
    "age":        "3 years",
    "emoji":      "🐕",
    "created_at": "2024-06-01T10:00:00.000000Z"
  }
]
```

`emoji` is set automatically by the server based on `pet_type`:
- `"Dogs"` → `"🐕"`
- `"Cats"` → `"🐈"`
- `"Birds"` → `"🦜"`

---

### POST `/users/pets/`

**Request body**
```json
{
  "name":  "Buddy",
  "type":  "Dogs",
  "breed": "Labrador",
  "age":   "3 years"
}
```

> The request field is `"type"` but the response field is `"pet_type"`.

**`type` allowed values:** `"Dogs"`, `"Cats"`, `"Birds"`

**Response `201`** — single pet object (same shape as list item above)

---

### PUT `/users/pets/<id>/`

Omitted fields keep their current values.

**Request body**
```json
{
  "name":  "Max",
  "type":  "Dogs",
  "breed": "Golden Retriever",
  "age":   "4 years"
}
```

**Response `200`** — updated pet object

**Error `404`**
```json
{ "detail": "Not found." }
```

---

### DELETE `/users/pets/<id>/`

**Response `204`** (no body)

---

## Cart

All cart endpoints require `Authorization: Bearer <access_token>`.

Product fields are copied at add-time (denormalised) because products live in a separate database. Always send the full product snapshot when adding to cart.

---

### GET `/users/cart/`

**Response `200`**
```json
[
  {
    "id":               1,
    "product_id":       7,
    "product_name":     "Kong Classic Dog Toy",
    "product_price":    "29.99",
    "product_emoji":    "🦴",
    "product_category": "Dogs",
    "quantity":         2,
    "created_at":       "2024-06-01T10:00:00.000000Z"
  }
]
```

`product_price` is a decimal string — parse before arithmetic.

---

### POST `/users/cart/`

Adds a product. If the same `product_id` is already in the cart, the `quantity` is **incremented** by the amount sent (not replaced).

**Request body**
```json
{
  "product_id":       7,
  "product_name":     "Kong Classic Dog Toy",
  "product_price":    29.99,
  "product_emoji":    "🦴",
  "product_category": "Dogs",
  "quantity":         1
}
```

**Response `201`** — newly added item
**Response `200`** — existing item with incremented quantity
Both return the cart item object.

**Error `400`**
```json
{ "detail": "product_id is required." }
```

---

### PUT `/users/cart/<id>/`

Sets the exact quantity. If `quantity < 1`, the item is deleted and `204` is returned.

**Request body**
```json
{ "quantity": 3 }
```

**Response `200`** — updated cart item, or `204` if quantity < 1 caused deletion

---

### DELETE `/users/cart/<id>/`

Removes a single item.

**Response `204`** (no body)

---

### DELETE `/users/cart/`

Clears the entire cart.

**Response `204`** (no body)

---

## Wishlist

All wishlist endpoints require `Authorization: Bearer <access_token>`.

Same denormalisation as cart. Each product can appear at most once per wishlist.

---

### GET `/users/wishlist/`

**Response `200`**
```json
[
  {
    "id":                     1,
    "product_id":             7,
    "product_name":           "Kong Classic Dog Toy",
    "product_price":          "29.99",
    "product_original_price": "39.99",
    "product_emoji":          "🦴",
    "product_category":       "Dogs",
    "in_stock":               true,
    "discount_pct":           25,
    "created_at":             "2024-06-01T10:00:00.000000Z"
  }
]
```

`discount_pct` is a server-computed integer. `0` means no discount.

---

### POST `/users/wishlist/`

**Request body**
```json
{
  "product_id":             7,
  "product_name":           "Kong Classic Dog Toy",
  "product_price":          29.99,
  "product_original_price": 39.99,
  "product_emoji":          "🦴",
  "product_category":       "Dogs",
  "in_stock":               true
}
```

**Response `201`** — the created wishlist item object

**Errors `400`**
```json
{ "detail": "Already in wishlist." }
{ "detail": "product_id is required." }
```

---

### DELETE `/users/wishlist/<id>/`

**Response `204`** (no body)

**Error `404`**
```json
{ "detail": "Not found." }
```

---

## Products

Read endpoints are **public** (no auth required).
Write endpoints (POST, PUT, PATCH, DELETE) require a Bearer token with `is_staff: true`.

---

### GET `/products/`

Returns a **lightweight** list — no `description`, `highlights`, or `specs`.

**Query parameters**

| Param | Example | Effect |
|---|---|---|
| `category` | `?category=Dogs` | Filter (`Dogs`, `Cats`, `Birds`) |
| `is_best_seller` | `?is_best_seller=true` | Best sellers only |
| `is_new_arrival` | `?is_new_arrival=true` | New arrivals only |
| `in_stock` | `?in_stock=true` | In-stock only |
| `search` | `?search=kong` | Case-insensitive name match |

**Response `200`**
```json
[
  {
    "id":             7,
    "name":           "Kong Classic Dog Toy",
    "category":       "Dogs",
    "price":          "29.99",
    "original_price": "39.99",
    "rating":         4.8,
    "reviews":        1243,
    "badge":          "Best Seller",
    "emoji":          "🦴",
    "in_stock":       true,
    "is_best_seller": true,
    "is_new_arrival": false,
    "discount_pct":   25
  }
]
```

`badge` may be `null`. `price` and `original_price` are decimal strings.

---

### GET `/products/<id>/`

Returns the **full** product object.

**Response `200`**
```json
{
  "id":             7,
  "name":           "Kong Classic Dog Toy",
  "category":       "Dogs",
  "price":          "29.99",
  "original_price": "39.99",
  "rating":         4.8,
  "reviews":        1243,
  "badge":          "Best Seller",
  "emoji":          "🦴",
  "in_stock":       true,
  "is_best_seller": true,
  "is_new_arrival": false,
  "description":    "The Kong Classic is the ultimate chew toy...",
  "highlights":     ["Durable natural rubber", "Dishwasher safe"],
  "specs":          { "Material": "Natural rubber", "Sizes": "S / M / L / XL" },
  "discount_pct":   25,
  "created_at":     "2024-06-01T10:00:00.000000Z",
  "updated_at":     "2024-06-01T10:00:00.000000Z"
}
```

`highlights` is a JSON array of strings.
`specs` is a JSON object with string keys and string values.

---

### POST `/products/` — staff only

**Request body**
```json
{
  "name":           "New Product",
  "category":       "Cats",
  "price":          "19.99",
  "original_price": "24.99",
  "rating":         0,
  "reviews":        0,
  "badge":          null,
  "emoji":          "🐟",
  "in_stock":       true,
  "is_best_seller": false,
  "is_new_arrival": true,
  "description":    "A great product.",
  "highlights":     ["Feature one", "Feature two"],
  "specs":          { "Weight": "200g" }
}
```

**Response `201`** — full product object

---

### PUT `/products/<id>/` — staff only

Full replacement. Same body shape as POST.

**Response `200`** — updated full product object

---

### PATCH `/products/<id>/` — staff only

Partial update — send only the fields to change.

**Response `200`** — updated full product object

---

### DELETE `/products/<id>/` — staff only

**Response `204`** (no body)

---

## Admin

Require a Bearer token with `is_staff: true`. A valid token from a non-staff user returns `403`.

---

### GET `/users/admin/stats/`

**Response `200`**
```json
{
  "total_products":  12,
  "in_stock":        10,
  "out_of_stock":    2,
  "total_users":     47,
  "cart_items":      83,
  "wishlist_items":  61
}
```

---

### GET `/users/admin/users/`

All users, newest first.

**Response `200`**
```json
[
  {
    "id":             1,
    "name":           "Jane Smith",
    "email":          "jane@example.com",
    "phone":          "0412345678",
    "is_staff":       false,
    "is_active":      true,
    "date_joined":    "01 Jun 2024",
    "cart_count":     2,
    "wishlist_count": 5
  }
]
```

`date_joined` is a formatted string `"DD Mon YYYY"`.

---

### PUT `/users/admin/users/<id>/`

Updates any user. All fields optional.

**Request body**
```json
{
  "name":      "Jane Doe",
  "phone":     "0499999999",
  "is_staff":  true,
  "is_active": false
}
```

**Response `200`** — same shape as a single item from `GET /users/admin/users/`

**Error `404`**
```json
{ "detail": "Not found." }
```

---

### DELETE `/users/admin/users/<id>/`

Deletes the user and all their data (pets, cart items, wishlist items).

**Response `204`** (no body)

**Errors**
```json
{ "detail": "You cannot delete your own account." }
{ "detail": "Not found." }
```

---

## iOS Token Management Pattern

```
1.  Login  →  save access + refresh tokens to Keychain
              Keys: "petoopia_access", "petoopia_refresh"
              Also cache the user JSON for offline display.

2.  Request →  attach header:  Authorization: Bearer <access>

3.  On 401  →  POST /users/token/refresh/ with saved refresh token
               Success: save new access token, retry original request once
               Failure: delete both Keychain entries, navigate to login

4.  Logout  →  delete both Keychain entries, clear cached user data
```

---

## Valid Category Values

```
"Dogs"
"Cats"
"Birds"
```

Used in: `Product.category`, `CartItem.product_category`, `WishlistItem.product_category`.
