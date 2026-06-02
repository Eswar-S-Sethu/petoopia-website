import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { api } from '../../services/api'
import './Cart.css'

const FREE_THRESHOLD = 50

// Normalise an API cart item to the shape this component uses
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

export default function Cart() {
  const { user }          = useAuth()
  const { refreshCounts } = useCart()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  // Load cart — from API if logged in, empty otherwise
  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/users/cart/')
      .then(data => setItems(data.map(normalise)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const updateQty = async (id, delta) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = Math.max(1, item.qty + delta)
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i))
    if (user) {
      try { await api.put(`/users/cart/${id}/`, { quantity: newQty }) } catch { /* ignore */ }
    }
  }

  const removeItem = async id => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (user) {
      try { await api.delete(`/users/cart/${id}/`) } catch { /* ignore */ }
    }
    refreshCounts()
  }

  const totalQty  = items.reduce((s, i) => s + i.qty, 0)
  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0)
  const delivery  = subtotal >= FREE_THRESHOLD ? 0 : 9.95
  const total     = subtotal + delivery
  const progress  = Math.min((subtotal / FREE_THRESHOLD) * 100, 100)

  if (loading) return (
    <>
      <Navbar />
      <div className="cart-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gray-400)', fontFamily: 'var(--font-body)' }}>Loading cart…</p>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="cart-page">

        {/* Breadcrumb */}
        <div className="pg-breadcrumb">
          <div className="container">
            <Link to="/" className="pg-breadcrumb__link">Home</Link>
            <span className="pg-breadcrumb__sep">›</span>
            <span>Shopping Cart</span>
          </div>
        </div>

        <div className="container cart-layout">

          {/* ── Left: items ── */}
          <div className="cart-main">
            <h1 className="cart-heading">
              Shopping Cart
              <span className="cart-heading__count">
                {totalQty} item{totalQty !== 1 ? 's' : ''}
              </span>
            </h1>

            {items.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty__emoji">🛒</span>
                <p className="cart-empty__title">Your cart is empty</p>
                <p className="cart-empty__sub">Looks like you haven't added anything yet.</p>
                <Link to="/" className="cart-empty__btn">Continue Shopping</Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map(item => (
                    <div key={item.id} className="cart-item">
                      {/* Image */}
                      <div className="cart-item__img">{item.emoji}</div>

                      {/* Info */}
                      <div className="cart-item__info">
                        <span className="cart-item__cat">{item.category}</span>
                        <h3 className="cart-item__name">{item.name}</h3>
                        <p className="cart-item__unit-price">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="cart-item__qty-wrap">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="cart-qty-val">{item.qty}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>

                      {/* Line total */}
                      <div className="cart-item__total">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>

                      {/* Remove */}
                      <button
                        className="cart-item__remove"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >×</button>
                    </div>
                  ))}
                </div>

                <div className="cart-continue">
                  <Link to="/" className="cart-continue__link">← Continue Shopping</Link>
                </div>
              </>
            )}
          </div>

          {/* ── Right: summary ── */}
          {items.length > 0 && (
            <div className="cart-sidebar">
              {/* Free delivery progress */}
              <div className="cart-delivery-bar">
                {delivery === 0 ? (
                  <p className="cart-delivery-bar__msg cart-delivery-bar__msg--done">
                    🎉 You've unlocked <strong>free delivery!</strong>
                  </p>
                ) : (
                  <p className="cart-delivery-bar__msg">
                    Add <strong>${(FREE_THRESHOLD - subtotal).toFixed(2)}</strong> more for free delivery
                  </p>
                )}
                <div className="cart-delivery-bar__track">
                  <div
                    className="cart-delivery-bar__fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Summary card */}
              <div className="cart-summary">
                <h2 className="cart-summary__title">Order Summary</h2>

                <div className="cart-summary__rows">
                  <div className="cart-summary__row">
                    <span>Subtotal ({totalQty} item{totalQty !== 1 ? 's' : ''})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary__row">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? 'cart-summary__free' : ''}>
                      {delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="cart-summary__row cart-summary__row--gst">
                    <span>GST included</span>
                    <span>${(total / 11).toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-summary__total">
                  <span>Total</span>
                  <div className="cart-summary__total-right">
                    <span className="cart-summary__total-amount">${total.toFixed(2)}</span>
                    <span className="cart-summary__total-currency">AUD</span>
                  </div>
                </div>

                <Link to="/checkout" className="cart-checkout-btn">
                  Proceed to Checkout →
                </Link>

                <div className="cart-payment">
                  <p className="cart-payment__label">We accept</p>
                  <div className="cart-payment__icons">
                    {['Visa', 'MC', 'PayPal', 'Apple Pay', 'AfterPay'].map(m => (
                      <span key={m} className="cart-payment__chip">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="cart-guarantees">
                <p>✓ Free delivery on orders over $50</p>
                <p>✓ 30-day easy returns</p>
                <p>✓ Secure &amp; encrypted checkout</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
