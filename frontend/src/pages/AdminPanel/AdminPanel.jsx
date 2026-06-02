import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api, convertProduct } from '../../services/api'
import './AdminPanel.css'

/* ── Helpers ── */
const CATEGORIES = ['Dogs', 'Cats', 'Birds']
const BADGES     = ['', 'Best Seller', 'New', 'Deal', 'Prime']

const EMPTY_FORM = {
  name: '', category: 'Dogs', price: '', original_price: '',
  rating: '', reviews: '', badge: '', emoji: '', in_stock: true,
  is_best_seller: false, is_new_arrival: false,
  description: '', highlights: '', specs: '',
}

function parseHighlights(str) {
  return str.split('\n').map(s => s.trim()).filter(Boolean)
}

function parseSpecs(str) {
  try { return JSON.parse(str) } catch { return {} }
}

function specsToStr(obj) {
  try { return JSON.stringify(obj, null, 2) } catch { return '' }
}

/* ── Stat card ── */
function StatCard({ label, value, sub, color }) {
  return (
    <div className="adm-stat" style={{ borderTop: `3px solid ${color}` }}>
      <span className="adm-stat__val">{value}</span>
      <span className="adm-stat__label">{label}</span>
      {sub && <span className="adm-stat__sub">{sub}</span>}
    </div>
  )
}

/* ── User edit form ── */
function UserForm({ initial, onSave, onCancel }) {
  const [form, setForm]     = useState({ name: initial.name || '', phone: initial.phone || '', is_staff: initial.is_staff || false, is_active: initial.is_active !== false })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = key => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [key]: val }))
  }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h2>Edit User</h2>
          <button className="adm-modal__close" onClick={onCancel}>×</button>
        </div>

        {error && <div className="adm-error">{error}</div>}

        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form__grid">

            <div className="adm-field adm-field--full">
              <label>Email</label>
              <input value={initial.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>

            <div className="adm-field adm-field--full">
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="Full name" />
            </div>

            <div className="adm-field adm-field--full">
              <label>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="Phone number" />
            </div>

            <div className="adm-field adm-field--checks">
              <label className="adm-check">
                <input type="checkbox" checked={form.is_staff} onChange={set('is_staff')} />
                Staff / Admin
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
                Active Account
              </label>
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Product form (add / edit) ── */
function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm]     = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = key => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [key]: val }))
  }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        price:          parseFloat(form.price)          || 0,
        original_price: parseFloat(form.original_price) || 0,
        rating:         parseFloat(form.rating)         || 0,
        reviews:        parseInt(form.reviews)          || 0,
        badge:          form.badge || null,
        highlights:     parseHighlights(form.highlights),
        specs:          parseSpecs(form.specs),
      }
      await onSave(payload)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h2>{initial.id ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="adm-modal__close" onClick={onCancel}>×</button>
        </div>

        {error && <div className="adm-error">{error}</div>}

        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form__grid">

            <div className="adm-field adm-field--full">
              <label>Product Name *</label>
              <input value={form.name} onChange={set('name')} required placeholder="Full product name" />
            </div>

            <div className="adm-field">
              <label>Category *</label>
              <select value={form.category} onChange={set('category')} required>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="adm-field">
              <label>Badge</label>
              <select value={form.badge || ''} onChange={set('badge')}>
                {BADGES.map(b => <option key={b} value={b}>{b || '— none —'}</option>)}
              </select>
            </div>

            <div className="adm-field">
              <label>Price (AUD) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
            </div>

            <div className="adm-field">
              <label>Original Price (AUD) *</label>
              <input type="number" step="0.01" min="0" value={form.original_price} onChange={set('original_price')} required />
            </div>

            <div className="adm-field">
              <label>Rating (0–5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={set('rating')} />
            </div>

            <div className="adm-field">
              <label>Review Count</label>
              <input type="number" min="0" value={form.reviews} onChange={set('reviews')} />
            </div>

            <div className="adm-field">
              <label>Emoji</label>
              <input value={form.emoji} onChange={set('emoji')} placeholder="e.g. 🐶" maxLength={10} />
            </div>

            <div className="adm-field adm-field--checks">
              <label className="adm-check">
                <input type="checkbox" checked={form.in_stock} onChange={set('in_stock')} />
                In Stock
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={form.is_best_seller} onChange={set('is_best_seller')} />
                Best Seller
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={form.is_new_arrival} onChange={set('is_new_arrival')} />
                New Arrival
              </label>
            </div>

            <div className="adm-field adm-field--full">
              <label>Description</label>
              <textarea rows={5} value={form.description} onChange={set('description')}
                placeholder="Full product description…" />
            </div>

            <div className="adm-field adm-field--full">
              <label>Highlights <span className="adm-hint">(one per line)</span></label>
              <textarea rows={4} value={form.highlights} onChange={set('highlights')}
                placeholder={'Highlight 1\nHighlight 2\nHighlight 3\nHighlight 4'} />
            </div>

            <div className="adm-field adm-field--full">
              <label>Specifications <span className="adm-hint">(JSON format)</span></label>
              <textarea rows={6} value={form.specs} onChange={set('specs')}
                placeholder={'{\n  "Weight": "12 kg",\n  "Country of Origin": "Australia"\n}'} />
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : (initial.id ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
   ══════════════════════════════════════════════════════════════ */
export default function AdminPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tab,          setTab]          = useState('dashboard')
  const [stats,        setStats]        = useState(null)
  const [products,     setProducts]     = useState([])
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(false)
  const [search,       setSearch]       = useState('')
  const [editTarget,   setEditTarget]   = useState(null)   // null | {} (add) | product (edit)
  const [deleteId,     setDeleteId]     = useState(null)
  const [editUser,     setEditUser]     = useState(null)   // null | user object
  const [deleteUserId, setDeleteUserId] = useState(null)
  const [toast,        setToast]        = useState('')

  // ── Access guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    if (!user.is_staff) { /* render access-denied below */ }
  }, [user, navigate])

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const data = await api.get('/users/admin/stats/')
      setStats(data)
    } catch { /* silently fail */ }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/products/')
      setProducts(data.map(convertProduct))
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/users/admin/users/')
      setUsers(data)
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!user?.is_staff) return
    loadStats()
  }, [user, loadStats])

  useEffect(() => {
    if (!user?.is_staff) return
    if (tab === 'products') loadProducts()
    if (tab === 'users')    loadUsers()
  }, [tab, user, loadProducts, loadUsers])

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── Product CRUD ─────────────────────────────────────────────────────────
  const handleSaveProduct = async payload => {
    if (editTarget?.id) {
      await api.put(`/products/${editTarget.id}/`, payload)
      showToast('Product updated.')
    } else {
      await api.post('/products/', payload)
      showToast('Product added.')
    }
    setEditTarget(null)
    loadProducts()
    loadStats()
  }

  const handleDeleteProduct = async () => {
    await api.delete(`/products/${deleteId}/`)
    setDeleteId(null)
    showToast('Product deleted.')
    loadProducts()
    loadStats()
  }

  // ── User CRUD ────────────────────────────────────────────────────────────
  const handleSaveUser = async payload => {
    await api.put(`/users/admin/users/${editUser.id}/`, payload)
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...payload, name: payload.name } : u))
    setEditUser(null)
    showToast('User updated.')
    loadUsers()
  }

  const handleDeleteUser = async () => {
    await api.delete(`/users/admin/users/${deleteUserId}/`)
    setDeleteUserId(null)
    showToast('User deleted.')
    loadUsers()
    loadStats()
  }

  // ── Form initial values ──────────────────────────────────────────────────
  const toFormValues = p => ({
    ...EMPTY_FORM,
    ...p,
    price:          String(p.price ?? ''),
    original_price: String(p.originalPrice ?? p.original_price ?? ''),
    highlights:     Array.isArray(p.highlights) ? p.highlights.join('\n') : '',
    specs:          typeof p.specs === 'object' ? specsToStr(p.specs) : '',
    badge:          p.badge ?? '',
  })

  // ── Filtered lists ───────────────────────────────────────────────────────
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // ── Access denied ────────────────────────────────────────────────────────
  if (!user?.is_staff) {
    return (
      <div className="adm-denied">
        <span className="adm-denied__emoji">🚫</span>
        <h2>Access Denied</h2>
        <p>This area is for Petoopia staff only.</p>
        <Link to="/" className="adm-btn adm-btn--primary">Back to Home</Link>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="adm-layout">

      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <Link to="/" className="adm-sidebar__logo">🐾 PETOOPIA</Link>
          <span className="adm-sidebar__badge">Admin</span>
        </div>

        <nav className="adm-sidebar__nav">
          {[
            { id: 'dashboard', label: 'Dashboard',   icon: '📊' },
            { id: 'products',  label: 'Products',     icon: '📦' },
            { id: 'users',     label: 'Users',        icon: '👥' },
          ].map(item => (
            <button
              key={item.id}
              className={`adm-nav-item ${tab === item.id ? 'adm-nav-item--active' : ''}`}
              onClick={() => { setTab(item.id); setSearch('') }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <span className="adm-sidebar__user">{user.name}</span>
          <div className="adm-sidebar__actions">
            <Link to="/" className="adm-sidebar__link">← Storefront</Link>
            <button className="adm-sidebar__link" onClick={logout}>Sign out</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">

        {/* Toast */}
        {toast && <div className="adm-toast">{toast}</div>}

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div className="adm-section">
            <h1 className="adm-page-title">Dashboard</h1>
            <p className="adm-page-sub">Overview of your Petoopia store.</p>

            <div className="adm-stats-grid">
              <StatCard label="Total Products" value={stats?.total_products ?? '—'} color="#0a0a0a" />
              <StatCard label="In Stock"        value={stats?.in_stock       ?? '—'} color="#16a34a" />
              <StatCard label="Out of Stock"    value={stats?.out_of_stock   ?? '—'} color="#dc2626" />
              <StatCard label="Registered Users" value={stats?.total_users   ?? '—'} color="#2563eb" />
              <StatCard label="Cart Items"      value={stats?.cart_items     ?? '—'} color="#d97706" />
              <StatCard label="Wishlist Items"  value={stats?.wishlist_items ?? '—'} color="#7c3aed" />
            </div>

            <div className="adm-dash-links">
              <button className="adm-dash-card" onClick={() => setTab('products')}>
                <span>📦</span>
                <span>Manage Products</span>
                <span className="adm-dash-card__arrow">→</span>
              </button>
              <button className="adm-dash-card" onClick={() => setTab('users')}>
                <span>👥</span>
                <span>View Users</span>
                <span className="adm-dash-card__arrow">→</span>
              </button>
              <a className="adm-dash-card" href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">
                <span>⚙️</span>
                <span>Django Admin</span>
                <span className="adm-dash-card__arrow">↗</span>
              </a>
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {tab === 'products' && (
          <div className="adm-section">
            <div className="adm-section__head">
              <div>
                <h1 className="adm-page-title">Products</h1>
                <p className="adm-page-sub">{products.length} products in catalogue</p>
              </div>
              <button className="adm-btn adm-btn--primary"
                onClick={() => setEditTarget({ ...EMPTY_FORM })}>
                + Add Product
              </button>
            </div>

            <div className="adm-toolbar">
              <input
                className="adm-search"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="adm-loading">Loading products…</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Emoji</th><th>Name</th><th>Category</th>
                      <th>Price</th><th>Original</th><th>Rating</th>
                      <th>Stock</th><th>Tags</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td className="adm-td-id">{p.id}</td>
                        <td className="adm-td-emoji">{p.emoji}</td>
                        <td className="adm-td-name">{p.name}</td>
                        <td><span className="adm-cat-chip">{p.category}</span></td>
                        <td>${p.price.toFixed(2)}</td>
                        <td className="adm-original">${p.originalPrice.toFixed(2)}</td>
                        <td>{'★'.repeat(Math.round(p.rating))} {p.rating}</td>
                        <td>
                          <span className={`adm-stock ${p.inStock ? 'adm-stock--in' : 'adm-stock--out'}`}>
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="adm-td-tags">
                          {p.badge && <span className="adm-tag">{p.badge}</span>}
                          {p.isBestSeller && <span className="adm-tag adm-tag--bs">BS</span>}
                          {p.isNewArrival && <span className="adm-tag adm-tag--na">New</span>}
                        </td>
                        <td className="adm-td-actions">
                          <button className="adm-action-btn adm-action-btn--edit"
                            onClick={() => setEditTarget(toFormValues(p))}>
                            Edit
                          </button>
                          <button className="adm-action-btn adm-action-btn--del"
                            onClick={() => setDeleteId(p.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan={10} className="adm-empty-row">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="adm-section">
            <div className="adm-section__head">
              <div>
                <h1 className="adm-page-title">Users</h1>
                <p className="adm-page-sub">{users.length} registered accounts</p>
              </div>
            </div>

            <div className="adm-toolbar">
              <input
                className="adm-search"
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="adm-loading">Loading users…</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                      <th>Joined</th><th>Cart</th><th>Wishlist</th><th>Role</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td className="adm-td-id">{u.id}</td>
                        <td className="adm-td-name">{u.name || '—'}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>{u.date_joined}</td>
                        <td>{u.cart_count}</td>
                        <td>{u.wishlist_count}</td>
                        <td>
                          <span className={`adm-role ${u.is_staff ? 'adm-role--staff' : 'adm-role--user'}`}>
                            {u.is_staff ? 'Staff' : 'Customer'}
                          </span>
                        </td>
                        <td>
                          <span className={`adm-stock ${u.is_active ? 'adm-stock--in' : 'adm-stock--out'}`}>
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="adm-td-actions">
                          <button className="adm-action-btn adm-action-btn--edit"
                            onClick={() => setEditUser(u)}>
                            Edit
                          </button>
                          <button className="adm-action-btn adm-action-btn--del"
                            onClick={() => setDeleteUserId(u.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={10} className="adm-empty-row">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Edit/Add Product modal ── */}
      {editTarget !== null && (
        <ProductForm
          initial={editTarget}
          onSave={handleSaveProduct}
          onCancel={() => setEditTarget(null)}
        />
      )}

      {/* ── Delete product confirm ── */}
      {deleteId !== null && (
        <div className="adm-modal-backdrop">
          <div className="adm-confirm">
            <p className="adm-confirm__text">
              Delete product #{deleteId}? This cannot be undone.
            </p>
            <div className="adm-confirm__actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="adm-btn adm-btn--danger" onClick={handleDeleteProduct}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit user modal ── */}
      {editUser !== null && (
        <UserForm
          initial={editUser}
          onSave={handleSaveUser}
          onCancel={() => setEditUser(null)}
        />
      )}

      {/* ── Delete user confirm ── */}
      {deleteUserId !== null && (
        <div className="adm-modal-backdrop">
          <div className="adm-confirm">
            <p className="adm-confirm__text">
              Delete user #{deleteUserId}? All their cart and wishlist data will also be removed. This cannot be undone.
            </p>
            <div className="adm-confirm__actions">
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeleteUserId(null)}>
                Cancel
              </button>
              <button className="adm-btn adm-btn--danger" onClick={handleDeleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
