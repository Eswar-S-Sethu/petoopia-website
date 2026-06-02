import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import './Checkout.css'

const FREE_THRESHOLD = 50

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', desc: '3–5 business days', price: 9.95 },
  { id: 'express',  label: 'Express Delivery',  desc: '1–2 business days', price: 19.95 },
  { id: 'free',     label: 'Free Delivery',      desc: '5–7 business days', price: 0,
    note: `Available on orders over $${FREE_THRESHOLD}` },
]

function normalise(item) {
  return {
    id:       item.id,
    name:     item.product_name,
    category: item.product_category,
    price:    parseFloat(item.product_price),
    emoji:    item.product_emoji,
    qty:      item.quantity,
  }
}

export default function Checkout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [delivery, setDelivery] = useState('standard')
  const [step,     setStep]     = useState(1)
  const [form,     setForm]     = useState({
    firstName: '', lastName: '',
    email:     user?.email ?? '',
    phone:     '',
    address:   '',
    city:      '',
    state:     '',
    postcode:  '',
    country:   'Australia',
  })

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    api.get('/users/cart/')
      .then(data => setItems(data.map(normalise)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, navigate])

  // Redirect back if cart is empty once loaded
  useEffect(() => {
    if (!loading && items.length === 0 && user) navigate('/cart')
  }, [loading, items, user, navigate])

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const subtotal      = items.reduce((s, i) => s + i.price * i.qty, 0)
  const freeEligible  = subtotal >= FREE_THRESHOLD
  const selectedOpt   = DELIVERY_OPTIONS.find(o => o.id === delivery)
  const deliveryFee   = (delivery === 'free' && !freeEligible) ? 9.95 : selectedOpt.price
  const total         = subtotal + deliveryFee
  const gst           = total / 11

  const addressComplete = form.firstName && form.lastName && form.email &&
                          form.address && form.city && form.state && form.postcode

  if (loading) return (
    <>
      <Navbar />
      <div className="co-loading">
        <p>Loading checkout…</p>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="co-page">

        {/* Breadcrumb */}
        <div className="pg-breadcrumb">
          <div className="container">
            <Link to="/"      className="pg-breadcrumb__link">Home</Link>
            <span className="pg-breadcrumb__sep">›</span>
            <Link to="/cart"  className="pg-breadcrumb__link">Cart</Link>
            <span className="pg-breadcrumb__sep">›</span>
            <span>Checkout</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="co-steps-bar">
          <div className="container co-steps-bar__inner">
            {['Delivery', 'Payment', 'Confirm'].map((label, i) => (
              <React.Fragment key={label}>
                <div className={`co-step ${step > i ? 'co-step--done' : step === i + 1 ? 'co-step--active' : ''}`}>
                  <span className="co-step__num">{step > i + 1 ? '✓' : i + 1}</span>
                  <span className="co-step__label">{label}</span>
                </div>
                {i < 2 && <div className={`co-step__line ${step > i + 1 ? 'co-step__line--done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="container co-layout">

          {/* ── LEFT: form ── */}
          <div className="co-form-col">

            {/* ── STEP 1: Delivery ── */}
            {step === 1 && (
              <>
                <section className="co-section">
                  <h2 className="co-section__title">Contact Information</h2>
                  <div className="co-grid-2">
                    <div className="co-field">
                      <label className="co-label">First Name *</label>
                      <input className="co-input" value={form.firstName} onChange={set('firstName')} placeholder="John" />
                    </div>
                    <div className="co-field">
                      <label className="co-label">Last Name *</label>
                      <input className="co-input" value={form.lastName} onChange={set('lastName')} placeholder="Smith" />
                    </div>
                  </div>
                  <div className="co-grid-2">
                    <div className="co-field">
                      <label className="co-label">Email *</label>
                      <input className="co-input" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
                    </div>
                    <div className="co-field">
                      <label className="co-label">Phone</label>
                      <input className="co-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+61 400 000 000" />
                    </div>
                  </div>
                </section>

                <section className="co-section">
                  <h2 className="co-section__title">Delivery Address</h2>
                  <div className="co-field">
                    <label className="co-label">Street Address *</label>
                    <input className="co-input" value={form.address} onChange={set('address')} placeholder="123 Main Street" />
                  </div>
                  <div className="co-grid-3">
                    <div className="co-field">
                      <label className="co-label">City / Suburb *</label>
                      <input className="co-input" value={form.city} onChange={set('city')} placeholder="Sydney" />
                    </div>
                    <div className="co-field">
                      <label className="co-label">State *</label>
                      <select className="co-input" value={form.state} onChange={set('state')}>
                        <option value="">Select…</option>
                        {['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="co-field">
                      <label className="co-label">Postcode *</label>
                      <input className="co-input" value={form.postcode} onChange={set('postcode')} placeholder="2000" maxLength={4} />
                    </div>
                  </div>
                  <div className="co-field">
                    <label className="co-label">Country</label>
                    <select className="co-input" value={form.country} onChange={set('country')}>
                      <option>Australia</option>
                      <option>New Zealand</option>
                    </select>
                  </div>
                </section>

                <section className="co-section">
                  <h2 className="co-section__title">Delivery Method</h2>
                  <div className="co-delivery-opts">
                    {DELIVERY_OPTIONS.map(opt => {
                      const disabled = opt.id === 'free' && !freeEligible
                      return (
                        <label
                          key={opt.id}
                          className={`co-delivery-opt ${delivery === opt.id ? 'co-delivery-opt--active' : ''} ${disabled ? 'co-delivery-opt--disabled' : ''}`}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value={opt.id}
                            checked={delivery === opt.id}
                            onChange={() => !disabled && setDelivery(opt.id)}
                            disabled={disabled}
                          />
                          <div className="co-delivery-opt__info">
                            <span className="co-delivery-opt__label">{opt.label}</span>
                            <span className="co-delivery-opt__desc">
                              {opt.desc}{disabled && opt.note ? ` — ${opt.note}` : ''}
                            </span>
                          </div>
                          <span className="co-delivery-opt__price">
                            {opt.price === 0 && !disabled ? 'FREE' : `$${opt.price.toFixed(2)}`}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </section>

                <button
                  className="co-next-btn"
                  onClick={() => setStep(2)}
                  disabled={!addressComplete}
                >
                  Continue to Payment →
                </button>
              </>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <>
                <section className="co-section">
                  <h2 className="co-section__title">Payment Details</h2>

                  {/* Stripe placeholder */}
                  <div className="co-stripe">
                    <div className="co-stripe__header">
                      <span className="co-stripe__logo">stripe</span>
                      <span className="co-stripe__secure">🔒 SSL Secured</span>
                    </div>

                    <div className="co-stripe__body">
                      <div className="co-field">
                        <label className="co-label">Card Number</label>
                        <input
                          className="co-input co-input--disabled"
                          disabled
                          placeholder="•••• •••• •••• ••••"
                        />
                      </div>
                      <div className="co-grid-2">
                        <div className="co-field">
                          <label className="co-label">Expiry Date</label>
                          <input className="co-input co-input--disabled" disabled placeholder="MM / YY" />
                        </div>
                        <div className="co-field">
                          <label className="co-label">CVC</label>
                          <input className="co-input co-input--disabled" disabled placeholder="•••" />
                        </div>
                      </div>
                      <div className="co-field">
                        <label className="co-label">Name on Card</label>
                        <input className="co-input co-input--disabled" disabled placeholder="John Smith" />
                      </div>
                    </div>

                    <div className="co-stripe__coming-soon">
                      <span className="co-stripe__cs-icon">🛠️</span>
                      <div>
                        <p className="co-stripe__cs-title">Stripe Integration Coming Soon</p>
                        <p className="co-stripe__cs-sub">
                          Payment processing will be handled securely by Stripe.
                          Replace this placeholder with <code>loadStripe()</code> and{' '}
                          <code>&lt;CardElement /&gt;</code> from <code>@stripe/react-stripe-js</code>.
                        </p>
                      </div>
                    </div>

                    <div className="co-stripe__methods">
                      {['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'].map(m => (
                        <span key={m} className="co-method-chip">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Delivery recap */}
                  <div className="co-recap">
                    <div className="co-recap__row">
                      <span className="co-recap__label">Delivering to</span>
                      <span className="co-recap__val">
                        {form.firstName} {form.lastName}, {form.address}, {form.city} {form.state} {form.postcode}
                      </span>
                    </div>
                    <div className="co-recap__row">
                      <span className="co-recap__label">Delivery</span>
                      <span className="co-recap__val">{selectedOpt.label} ({selectedOpt.desc})</span>
                    </div>
                    <button className="co-recap__change" onClick={() => setStep(1)}>Change</button>
                  </div>
                </section>

                <div className="co-step2-actions">
                  <button className="co-back-btn" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className="co-pay-btn"
                    disabled
                    title="Stripe integration coming soon — connect your Stripe publishable key to enable"
                  >
                    🔒 Place Order — ${total.toFixed(2)} AUD
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: order summary ── */}
          <div className="co-summary-col">
            <div className="co-summary">
              <h2 className="co-summary__title">Order Summary</h2>

              <div className="co-summary__items">
                {items.map(item => (
                  <div key={item.id} className="co-summary__item">
                    <div className="co-summary__item-img">{item.emoji}</div>
                    <div className="co-summary__item-info">
                      <p className="co-summary__item-name">{item.name}</p>
                      <p className="co-summary__item-cat">{item.category}</p>
                    </div>
                    <div className="co-summary__item-right">
                      <span className="co-summary__item-qty">×{item.qty}</span>
                      <span className="co-summary__item-price">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="co-summary__rows">
                <div className="co-summary__row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="co-summary__row">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'co-summary__free' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="co-summary__row co-summary__row--gst">
                  <span>GST included</span>
                  <span>${gst.toFixed(2)}</span>
                </div>
              </div>

              <div className="co-summary__total">
                <span>Total</span>
                <div>
                  <span className="co-summary__total-amount">${total.toFixed(2)}</span>
                  <span className="co-summary__total-currency"> AUD</span>
                </div>
              </div>

              <div className="co-summary__guarantees">
                <p>✓ Free delivery on orders over $50</p>
                <p>✓ 30-day easy returns</p>
                <p>✓ Secure &amp; encrypted checkout</p>
              </div>

              <Link to="/cart" className="co-summary__edit">
                ← Edit cart
              </Link>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
