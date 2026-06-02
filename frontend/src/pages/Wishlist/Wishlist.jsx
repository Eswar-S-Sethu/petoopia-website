import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { api } from '../../services/api'
import './Wishlist.css'

function normalise(item) {
  return {
    id:            item.id,
    productId:     item.product_id,
    name:          item.product_name,
    category:      item.product_category,
    price:         parseFloat(item.product_price),
    originalPrice: parseFloat(item.product_original_price),
    emoji:         item.product_emoji,
    inStock:       item.in_stock,
  }
}

export default function Wishlist() {
  const { user }                   = useAuth()
  const { addToCart, refreshCounts } = useCart()
  const navigate                   = useNavigate()
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [addedToCart, setAddedToCart] = useState({})

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/users/wishlist/')
      .then(data => setItems(data.map(normalise)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const removeItem = async id => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (user) {
      try { await api.delete(`/users/wishlist/${id}/`) } catch { /* ignore */ }
    }
    refreshCounts()
  }

  const handleAddToCart = async item => {
    if (!user) { navigate('/signin'); return }
    setAddedToCart(prev => ({ ...prev, [item.id]: true }))
    await addToCart({
      id:       item.productId,
      name:     item.name,
      price:    item.price,
      emoji:    item.emoji,
      category: item.category,
    })
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [item.id]: false }))
    }, 1800)
  }

  const savings = items.reduce((s, i) => s + (i.originalPrice - i.price), 0)

  if (loading) return (
    <>
      <Navbar />
      <div className="wishlist-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gray-400)', fontFamily: 'var(--font-body)' }}>Loading wishlist…</p>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="wishlist-page">

        {/* Breadcrumb */}
        <div className="pg-breadcrumb">
          <div className="container">
            <Link to="/" className="pg-breadcrumb__link">Home</Link>
            <span className="pg-breadcrumb__sep">›</span>
            <span>Wishlist</span>
          </div>
        </div>

        <div className="container wishlist-layout">

          {/* Heading */}
          <div className="wishlist-header">
            <h1 className="wishlist-heading">
              My Wishlist
              {items.length > 0 && (
                <span className="wishlist-heading__count">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              )}
            </h1>
            {items.length > 0 && savings > 0 && (
              <p className="wishlist-savings">
                You're saving <strong>${savings.toFixed(2)}</strong> on wishlisted items
              </p>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty state */
            <div className="wishlist-empty">
              <span className="wishlist-empty__emoji">🤍</span>
              <p className="wishlist-empty__title">Your wishlist is empty</p>
              <p className="wishlist-empty__sub">Save items you love and come back to them anytime.</p>
              <Link to="/shop" className="wishlist-empty__btn">Discover Products</Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {items.map(item => {
                const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                return (
                  <div key={item.id} className="wl-card">
                    {/* Remove */}
                    <button
                      className="wl-card__remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove from wishlist"
                    >×</button>

                    {/* Badge */}
                    {discount > 0 && (
                      <span className="wl-card__badge">−{discount}%</span>
                    )}

                    {/* Image */}
                    <Link to={`/product/${item.productId}`} className="wl-card__img-link">
                      <div className="wl-card__img">{item.emoji}</div>
                    </Link>

                    {/* Info */}
                    <div className="wl-card__info">
                      <span className="wl-card__cat">{item.category}</span>
                      <h3 className="wl-card__name">{item.name}</h3>

                      <div className="wl-card__prices">
                        <span className="wl-card__price">${item.price.toFixed(2)}</span>
                        {item.originalPrice > item.price && (
                          <span className="wl-card__original">${item.originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {item.inStock ? (
                        <span className="wl-card__stock wl-card__stock--in">In Stock</span>
                      ) : (
                        <span className="wl-card__stock wl-card__stock--out">Out of Stock</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="wl-card__actions">
                      <button
                        className={`wl-card__add-btn ${addedToCart[item.id] ? 'wl-card__add-btn--done' : ''}`}
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                      >
                        {addedToCart[item.id] ? '✓ Added to Cart' : 'Move to Cart'}
                      </button>
                      <Link to="/cart" className="wl-card__view-btn">View Cart →</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
