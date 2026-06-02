/* ============================================================
   Petoopia API service
   All requests go to /api/* — Vite proxies them to localhost:8000
   ============================================================ */

// In production VITE_API_URL is set to the Render backend URL,
// e.g. "https://petoopia-backend.onrender.com/api".
// Locally the Vite proxy handles /api/* → localhost:8000.
const BASE = import.meta.env.VITE_API_URL ?? '/api'

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('petoopia_token')
}

export function setTokens(access, refresh) {
  localStorage.setItem('petoopia_token', access)
  localStorage.setItem('petoopia_refresh', refresh)
}

export function clearTokens() {
  localStorage.removeItem('petoopia_token')
  localStorage.removeItem('petoopia_refresh')
  localStorage.removeItem('petoopia_user')
}

// ── Core request ─────────────────────────────────────────────────────────────

async function request(method, path, body = null, isRetry = false) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body !== null) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, options)

  if (res.status === 204) return null

  // On 401, attempt a silent token refresh then retry once
  if (res.status === 401 && !isRetry) {
    const refreshToken = localStorage.getItem('petoopia_refresh')
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE}/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setTokens(refreshData.access, refreshData.refresh ?? refreshToken)
        return request(method, path, body, true)
      }
    }
    clearTokens()
    window.location.href = '/signin'
    return
  }

  const data = await res.json().catch(() => ({ detail: 'Unknown error' }))

  if (!res.ok) {
    const msg =
      data.detail ||
      Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ')
    throw new Error(msg || `Request failed (${res.status})`)
  }

  return data
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
}

// ── Product helpers ───────────────────────────────────────────────────────────

/**
 * Convert a Django product (snake_case) to the camelCase shape
 * the frontend components already expect.
 */
export function convertProduct(p) {
  return {
    id:            p.id,
    name:          p.name,
    category:      p.category,
    price:         parseFloat(p.price),
    originalPrice: parseFloat(p.original_price),
    rating:        p.rating,
    reviews:       p.reviews,
    badge:         p.badge,
    emoji:         p.emoji,
    inStock:       p.in_stock,
    isBestSeller:  p.is_best_seller,
    isNewArrival:  p.is_new_arrival,
    description:   p.description   ?? '',
    highlights:    p.highlights    ?? [],
    specs:         p.specs         ?? {},
  }
}
