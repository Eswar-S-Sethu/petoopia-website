import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import './Account.css'

/* ── Mock data ── */
const INIT_USER = {
  name: 'Eswar Kumar',
  email: 'eswar@example.com',
  mobile: '9876543210',
  dob: '1995-06-15',
  memberSince: 'January 2024',
}

const INIT_PETS = [
  { id: 1, name: 'Bruno',    type: 'Dogs',  breed: 'Labrador Retriever', age: '3 years',  emoji: '🐕' },
  { id: 2, name: 'Whiskers', type: 'Cats',  breed: 'Persian',            age: '5 years',  emoji: '🐈' },
  { id: 3, name: 'Tweety',   type: 'Birds', breed: 'Budgerigar',         age: '1.5 years', emoji: '🦜' },
]

const MOCK_ORDERS = [
  { id: 'PET-10042', date: '12 May 2026', items: 3, total: 187, status: 'Delivered' },
  { id: 'PET-10038', date: '02 May 2026', items: 1, total: 59,  status: 'Delivered' },
  { id: 'PET-10031', date: '18 Apr 2026', items: 2, total: 105, status: 'Shipped'   },
  { id: 'PET-10024', date: '05 Apr 2026', items: 4, total: 213, status: 'Delivered' },
]

const NAV = [
  { id: 'overview',   label: 'Overview',      emoji: '🏠' },
  { id: 'personal',   label: 'Personal Info',  emoji: '👤' },
  { id: 'pets',       label: 'My Pets',        emoji: '🐾' },
  { id: 'orders',     label: 'My Orders',      emoji: '📦' },
  { id: 'addresses',  label: 'Addresses',      emoji: '📍' },
  { id: 'security',   label: 'Security',       emoji: '🔒' },
]

const PET_EMOJI = { Dogs: '🐕', Cats: '🐈', Birds: '🦜' }

/* ── Password strength (reused from SignUp) ── */
function getStrength(pw) {
  if (!pw) return { level: 0, label: '', width: '0%' }
  if (pw.length < 6) return { level: 1, label: 'Too short', width: '20%' }
  const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/]
  const score = checks.filter(r => r.test(pw)).length + (pw.length >= 10 ? 1 : 0)
  if (score <= 2) return { level: 2, label: 'Weak',   width: '35%' }
  if (score === 3) return { level: 3, label: 'Fair',   width: '60%' }
  if (score === 4) return { level: 4, label: 'Good',   width: '80%' }
  return              { level: 5, label: 'Strong', width: '100%' }
}

/* ════════════════════════════════════════════
   SECTIONS
   ════════════════════════════════════════════ */

/* ── Overview ── */
function OverviewSection({ user, setTab }) {
  const stats = [
    { emoji: '📦', value: MOCK_ORDERS.length, label: 'Orders placed' },
    { emoji: '🏆', value: '1,240',            label: 'Paw Points' },
    { emoji: '❤️',  value: 8,                  label: 'Wishlist items' },
  ]
  const quick = [
    { emoji: '🐾', label: 'My Pets',      tab: 'pets'      },
    { emoji: '📦', label: 'My Orders',    tab: 'orders'    },
    { emoji: '📍', label: 'Addresses',    tab: 'addresses' },
    { emoji: '🔒', label: 'Security',     tab: 'security'  },
  ]
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase()

  return (
    <div className="ac-section">
      {/* Welcome banner */}
      <div className="ac-welcome">
        <div className="ac-welcome__avatar">{initials}</div>
        <div>
          <h2 className="ac-welcome__name">Welcome back, {user.name.split(' ')[0]}! 🐾</h2>
          <p className="ac-welcome__meta">Member since {user.memberSince} · {user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="ac-stats">
        {stats.map(s => (
          <div key={s.label} className="ac-stat">
            <span className="ac-stat__emoji">{s.emoji}</span>
            <span className="ac-stat__value">{s.value}</span>
            <span className="ac-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h3 className="ac-sub-heading">Quick actions</h3>
      <div className="ac-quick-grid">
        {quick.map(q => (
          <button key={q.tab} className="ac-quick-card" onClick={() => setTab(q.tab)}>
            <span className="ac-quick-card__emoji">{q.emoji}</span>
            <span className="ac-quick-card__label">{q.label}</span>
            <span className="ac-quick-card__arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Personal Info ── */
function PersonalSection({ user, setUser }) {
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState(user)
  const [saved,   setSaved]   = useState(false)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = () => {
    setUser(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const rows = [
    { label: 'Full name',        key: 'name',   type: 'text'  },
    { label: 'Email address',    key: 'email',  type: 'email' },
    { label: 'Mobile number',    key: 'mobile', type: 'tel'   },
    { label: 'Date of birth',    key: 'dob',    type: 'date'  },
  ]

  return (
    <div className="ac-section">
      <div className="ac-section-head">
        <div>
          <h2 className="ac-section-title">Personal Information</h2>
          <p className="ac-section-sub">Manage your name, email and contact details.</p>
        </div>
        {!editing && (
          <button className="ac-btn ac-btn--outline" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      {saved && <p className="ac-saved-msg">✓ Changes saved successfully.</p>}

      {!editing ? (
        <div className="ac-info-list">
          {rows.map(r => (
            <div key={r.key} className="ac-info-row">
              <span className="ac-info-label">{r.label}</span>
              <span className="ac-info-value">
                {r.key === 'dob' && form.dob
                  ? new Date(form.dob).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
                  : r.key === 'mobile' ? `+61 ${form.mobile}` : form[r.key]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="ac-form">
          {rows.map(r => (
            <div key={r.key} className="ac-form-field">
              <label className="ac-form-label" htmlFor={`pi-${r.key}`}>{r.label}</label>
              <input
                id={`pi-${r.key}`}
                type={r.type}
                className="ac-form-input"
                value={form[r.key]}
                onChange={set(r.key)}
              />
            </div>
          ))}
          <div className="ac-form-actions">
            <button className="ac-btn ac-btn--primary" onClick={save}>Save changes</button>
            <button className="ac-btn ac-btn--ghost" onClick={() => { setForm(user); setEditing(false) }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── My Pets ── */
const EMPTY_PET = { name: '', type: 'Dogs', breed: '', age: '' }

function PetsSection({ pets, setPets }) {
  const [adding,   setAdding]   = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [petForm,  setPetForm]  = useState(EMPTY_PET)
  const [errors,   setErrors]   = useState({})

  const setF = k => e => { setPetForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!petForm.name.trim())  e.name  = 'Enter your pet\'s name.'
    if (!petForm.breed.trim()) e.breed = 'Enter a breed.'
    if (!petForm.age.trim())   e.age   = 'Enter an age.'
    return e
  }

  const savePet = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const entry = { ...petForm, emoji: PET_EMOJI[petForm.type] }
    if (editId !== null) {
      setPets(ps => ps.map(p => p.id === editId ? { ...entry, id: editId } : p))
      setEditId(null)
    } else {
      setPets(ps => [...ps, { ...entry, id: Date.now() }])
      setAdding(false)
    }
    setPetForm(EMPTY_PET)
    setErrors({})
  }

  const startEdit = (pet) => {
    setEditId(pet.id)
    setPetForm({ name: pet.name, type: pet.type, breed: pet.breed, age: pet.age })
    setAdding(false)
  }

  const removePet = id => setPets(ps => ps.filter(p => p.id !== id))

  const cancelForm = () => { setAdding(false); setEditId(null); setPetForm(EMPTY_PET); setErrors({}) }

  const PetForm = (
    <div className="ac-pet-form">
      <h4 className="ac-pet-form__title">{editId !== null ? 'Edit pet' : 'Add a new pet'}</h4>
      <div className="ac-form ac-form--inline">
        <div className={`ac-form-field ${errors.name ? 'ac-form-field--error' : ''}`}>
          <label className="ac-form-label">Pet name</label>
          <input className="ac-form-input" type="text" placeholder="e.g. Bruno"
            value={petForm.name} onChange={setF('name')} />
          {errors.name && <p className="ac-form-error">{errors.name}</p>}
        </div>
        <div className="ac-form-field">
          <label className="ac-form-label">Type</label>
          <select className="ac-form-input" value={petForm.type} onChange={setF('type')}>
            <option>Dogs</option><option>Cats</option><option>Birds</option>
          </select>
        </div>
        <div className={`ac-form-field ${errors.breed ? 'ac-form-field--error' : ''}`}>
          <label className="ac-form-label">Breed</label>
          <input className="ac-form-input" type="text" placeholder="e.g. Labrador"
            value={petForm.breed} onChange={setF('breed')} />
          {errors.breed && <p className="ac-form-error">{errors.breed}</p>}
        </div>
        <div className={`ac-form-field ${errors.age ? 'ac-form-field--error' : ''}`}>
          <label className="ac-form-label">Age</label>
          <input className="ac-form-input" type="text" placeholder="e.g. 2 years"
            value={petForm.age} onChange={setF('age')} />
          {errors.age && <p className="ac-form-error">{errors.age}</p>}
        </div>
      </div>
      <div className="ac-form-actions">
        <button className="ac-btn ac-btn--primary" onClick={savePet}>
          {editId !== null ? 'Save changes' : 'Add pet'}
        </button>
        <button className="ac-btn ac-btn--ghost" onClick={cancelForm}>Cancel</button>
      </div>
    </div>
  )

  return (
    <div className="ac-section">
      <div className="ac-section-head">
        <div>
          <h2 className="ac-section-title">My Pets</h2>
          <p className="ac-section-sub">Your registered pets — we'll personalise recommendations for them.</p>
        </div>
        {!adding && editId === null && (
          <button className="ac-btn ac-btn--primary" onClick={() => setAdding(true)}>
            + Add a Pet
          </button>
        )}
      </div>

      {adding && PetForm}

      {pets.length === 0 && !adding ? (
        <div className="ac-empty">
          <span className="ac-empty__emoji">🐾</span>
          <p className="ac-empty__text">No pets added yet.</p>
          <button className="ac-btn ac-btn--primary" onClick={() => setAdding(true)}>Add your first pet</button>
        </div>
      ) : (
        <div className="ac-pet-grid">
          {pets.map(pet => (
            editId === pet.id ? (
              <div key={pet.id}>{PetForm}</div>
            ) : (
              <div key={pet.id} className="ac-pet-card">
                <div className="ac-pet-card__emoji">{pet.emoji}</div>
                <div className="ac-pet-card__info">
                  <h4 className="ac-pet-card__name">{pet.name}</h4>
                  <span className="ac-pet-card__type">{pet.type}</span>
                  <p className="ac-pet-card__detail">{pet.breed} · {pet.age}</p>
                </div>
                <div className="ac-pet-card__actions">
                  <button className="ac-pet-btn" onClick={() => startEdit(pet)}>Edit</button>
                  <button className="ac-pet-btn ac-pet-btn--remove" onClick={() => removePet(pet.id)}>Remove</button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Orders ── */
const STATUS_CLASS = { Delivered: 'delivered', Shipped: 'shipped', Processing: 'processing' }

function OrdersSection() {
  return (
    <div className="ac-section">
      <div className="ac-section-head">
        <div>
          <h2 className="ac-section-title">My Orders</h2>
          <p className="ac-section-sub">{MOCK_ORDERS.length} orders placed.</p>
        </div>
      </div>
      <div className="ac-order-list">
        {MOCK_ORDERS.map(o => (
          <div key={o.id} className="ac-order">
            <div className="ac-order__left">
              <p className="ac-order__id">#{o.id}</p>
              <p className="ac-order__meta">{o.date} · {o.items} item{o.items > 1 ? 's' : ''}</p>
            </div>
            <div className="ac-order__right">
              <span className={`ac-order__status ac-order__status--${STATUS_CLASS[o.status]}`}>
                {o.status}
              </span>
              <span className="ac-order__total">${o.total.toFixed(2)}</span>
              <button className="ac-btn ac-btn--outline ac-btn--sm">View details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Addresses ── */
function AddressesSection() {
  const [adding, setAdding] = useState(false)

  return (
    <div className="ac-section">
      <div className="ac-section-head">
        <div>
          <h2 className="ac-section-title">Saved Addresses</h2>
          <p className="ac-section-sub">Manage your delivery addresses.</p>
        </div>
        {!adding && (
          <button className="ac-btn ac-btn--primary" onClick={() => setAdding(true)}>
            + Add address
          </button>
        )}
      </div>

      {adding && (
        <div className="ac-pet-form">
          <h4 className="ac-pet-form__title">New address</h4>
          <div className="ac-form ac-form--inline">
            {['Full name', 'Mobile', 'Postcode', 'Unit / House no.', 'Street / Suburb', 'City', 'State / Territory'].map(f => (
              <div key={f} className="ac-form-field">
                <label className="ac-form-label">{f}</label>
                <input className="ac-form-input" type="text" placeholder={f} />
              </div>
            ))}
          </div>
          <div className="ac-form-actions">
            <button className="ac-btn ac-btn--primary">Save address</button>
            <button className="ac-btn ac-btn--ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {!adding && (
        <div className="ac-empty">
          <span className="ac-empty__emoji">📍</span>
          <p className="ac-empty__text">No saved addresses yet.</p>
          <button className="ac-btn ac-btn--primary" onClick={() => setAdding(true)}>
            Add your first address
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Security ── */
function SecuritySection() {
  const [form,       setForm]       = useState({ current: '', next: '', confirm: '' })
  const [show,       setShow]       = useState({ current: false, next: false, confirm: false })
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [saved,      setSaved]      = useState(false)

  const strength = getStrength(form.next)
  const setF = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })) }
  const toggleShow = k => () => setShow(p => ({ ...p, [k]: !p[k] }))

  const validate = () => {
    const e = {}
    if (!form.current)         e.current = 'Enter your current password.'
    if (!form.next)            e.next    = 'Enter a new password.'
    else if (form.next.length < 8) e.next = 'Must be at least 8 characters.'
    if (!form.confirm)         e.confirm = 'Confirm your new password.'
    else if (form.next !== form.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = ev => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    api.post('/users/change-password/', {
      current_password: form.current,
      new_password: form.next,
    }).then(() => {
      setSaved(true)
      setForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setSaved(false), 4000)
    }).catch(err => {
      setErrors({ current: err.message || 'Password update failed.' })
    }).finally(() => setSubmitting(false))
  }

  const fields = [
    { key: 'current', label: 'Current password',     placeholder: 'Your current password' },
    { key: 'next',    label: 'New password',          placeholder: 'At least 8 characters'  },
    { key: 'confirm', label: 'Confirm new password',  placeholder: 'Same password again'     },
  ]

  return (
    <div className="ac-section">
      <div className="ac-section-head">
        <div>
          <h2 className="ac-section-title">Security</h2>
          <p className="ac-section-sub">Update your password to keep your account safe.</p>
        </div>
      </div>

      {saved && <p className="ac-saved-msg">✓ Password updated successfully.</p>}

      <form className="ac-form" onSubmit={handleSubmit} noValidate style={{ maxWidth: 420 }}>
        {fields.map(f => (
          <div key={f.key} className={`ac-form-field ${errors[f.key] ? 'ac-form-field--error' : ''}`}>
            <label className="ac-form-label" htmlFor={`sec-${f.key}`}>{f.label}</label>
            <div className="ac-pw-wrap">
              <input
                id={`sec-${f.key}`}
                type={show[f.key] ? 'text' : 'password'}
                className="ac-form-input"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={setF(f.key)}
                autoComplete={f.key === 'current' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="ac-pw-toggle"
                onClick={toggleShow(f.key)}
                aria-label={show[f.key] ? 'Hide' : 'Show'}>
                {show[f.key] ? 'Hide' : 'Show'}
              </button>
            </div>
            {f.key === 'next' && form.next && (
              <div className="auth-strength">
                <div className="auth-strength__bar">
                  <div className={`auth-strength__fill auth-strength__fill--${strength.level}`}
                    style={{ width: strength.width }} />
                </div>
                <span className={`auth-strength__label auth-strength__label--${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
            {f.key === 'confirm' && form.confirm && (
              <p className={`rp-match ${form.next === form.confirm ? 'rp-match--ok' : 'rp-match--no'}`}>
                {form.next === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
            {errors[f.key] && <p className="ac-form-error">{errors[f.key]}</p>}
          </div>
        ))}
        <div className="ac-form-actions">
          <button type="submit" className="ac-btn ac-btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function Account() {
  const navigate  = useNavigate()
  const { user: authUser, logout, refreshUser } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
  const [user,      setUser]      = useState(INIT_USER)
  const [pets,      setPets]      = useState(INIT_PETS)
  const [loading,   setLoading]   = useState(true)

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authUser) { navigate('/signin'); return }
  }, [authUser, navigate])

  // Load real profile + pets from backend
  useEffect(() => {
    if (!authUser) return
    let cancelled = false

    Promise.all([
      api.get('/users/profile/'),
      api.get('/users/pets/'),
    ]).then(([profile, petsData]) => {
      if (cancelled) return
      setUser({
        name:        profile.name        || INIT_USER.name,
        email:       profile.email       || INIT_USER.email,
        mobile:      profile.phone       || INIT_USER.mobile,
        dob:         INIT_USER.dob,
        memberSince: profile.member_since || INIT_USER.memberSince,
      })
      if (petsData?.length) {
        setPets(petsData.map(p => ({
          id:    p.id,
          name:  p.name,
          type:  p.pet_type,
          breed: p.breed,
          age:   p.age,
          emoji: p.emoji,
        })))
      }
    }).catch(() => {
      // Backend unavailable — static mock data already set
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [authUser])

  const handleLogout = () => { logout(); navigate('/signin') }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase()

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gray-400)', fontFamily: 'var(--font-body)' }}>Loading account…</p>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="account-page">
        {/* Breadcrumb */}
        <div className="account-breadcrumb">
          <div className="container">
            <Link to="/" className="account-breadcrumb__link">Home</Link>
            <span className="account-breadcrumb__sep">›</span>
            <span>My Account</span>
          </div>
        </div>

        <div className="container account-layout">
          {/* ── Sidebar ── */}
          <aside className="account-sidebar">
            <div className="account-sidebar__profile">
              <div className="account-sidebar__avatar">{initials}</div>
              <div className="account-sidebar__info">
                <p className="account-sidebar__name">{user.name}</p>
                <p className="account-sidebar__email">{user.email}</p>
              </div>
            </div>

            <nav className="account-sidebar__nav">
              {NAV.map(item => (
                <button
                  key={item.id}
                  className={`account-sidebar__item ${activeTab === item.id ? 'account-sidebar__item--active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="account-sidebar__item-emoji">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <button
              className="account-sidebar__signout"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </aside>

          {/* ── Content ── */}
          <main className="account-content">
            {activeTab === 'overview'   && <OverviewSection  user={user} setTab={setActiveTab} />}
            {activeTab === 'personal'   && <PersonalSection  user={user} setUser={setUser} />}
            {activeTab === 'pets'       && <PetsSection      pets={pets} setPets={setPets} />}
            {activeTab === 'orders'     && <OrdersSection />}
            {activeTab === 'addresses'  && <AddressesSection />}
            {activeTab === 'security'   && <SecuritySection />}
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}
