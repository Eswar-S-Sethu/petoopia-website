import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bestSellers as staticBestSellers, newArrivals as staticNewArrivals } from '../data/products'
import { api, convertProduct } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './FeaturedProducts.css'

/* ── Star rating ── */
function Stars({ rating }) {
  return (
    <div className="prod-stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`prod-star ${
            i <= Math.floor(rating)
              ? 'prod-star--full'
              : i - 0.5 <= rating
              ? 'prod-star--half'
              : 'prod-star--empty'
          }`}
        >★</span>
      ))}
    </div>
  )
}

/* ── Single product card ── */
function ProductCard({ product }) {
  const { user }                   = useAuth()
  const { addToCart, addToWishlist } = useCart()
  const navigate                   = useNavigate()
  const [added,      setAdded]      = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAddToCart = async () => {
    if (!user) { navigate('/signin'); return }
    setAdded(true)
    await addToCart(product)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/signin'); return }
    const ok = await addToWishlist(product)
    if (ok) { setWishlisted(true); setTimeout(() => setWishlisted(false), 1800) }
  }

  return (
    <div className="prod-card">
      {product.badge && (
        <span className={`prod-badge prod-badge--${product.badge.toLowerCase().replace(' ', '-')}`}>
          {product.badge}
        </span>
      )}

      <button
        className={`prod-wl-btn ${wishlisted ? 'prod-wl-btn--active' : ''}`}
        onClick={handleWishlist}
        title="Add to Wishlist"
        aria-label="Add to Wishlist"
      >
        {wishlisted ? '♥' : '♡'}
      </button>

      <Link to={`/product/${product.id}`} className="prod-image-link">
        <div className="prod-image">
          <span className="prod-emoji" aria-hidden="true">{product.emoji}</span>
          <div className="prod-image-overlay" />
        </div>
      </Link>

      <div className="prod-info">
        <p className="prod-category">{product.category}</p>
        <Link to={`/product/${product.id}`} className="prod-name-link">
          <h3 className="prod-name">{product.name}</h3>
        </Link>

        <div className="prod-rating-row">
          <Stars rating={product.rating} />
          <span className="prod-reviews">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="prod-price-row">
          <span className="prod-price">${product.price.toFixed(2)}</span>
          <span className="prod-original">${product.originalPrice.toFixed(2)}</span>
          <span className="prod-discount">{discount}% off</span>
        </div>

        <button
          className={`prod-atc ${added ? 'prod-atc--added' : ''}`}
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {added ? '✓ Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

/* ── Section ── */
function ProductSection({ title, link, products, loading }) {
  return (
    <div className="prod-section">
      <div className="section-label">
        <h2 className="section-label__title">{title}</h2>
        <span className="section-label__line" />
        <Link to="/shop" className="section-label__link">{link} →</Link>
      </div>
      {loading ? (
        <div className="prod-skeleton-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="prod-skeleton" />)}
        </div>
      ) : (
        <div className="prod-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

export default function FeaturedProducts() {
  const [bestSellers,  setBestSellers]  = useState(staticBestSellers)
  const [newArrivals,  setNewArrivals]  = useState(staticNewArrivals)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [bsData, naData] = await Promise.all([
          api.get('/products/?is_best_seller=true'),
          api.get('/products/?is_new_arrival=true'),
        ])
        if (cancelled) return
        if (bsData?.length) setBestSellers(bsData.map(convertProduct))
        if (naData?.length) setNewArrivals(naData.map(convertProduct))
      } catch {
        // Backend unavailable — static data already set as default
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="prod-wrapper">
      <div className="container">
        <ProductSection
          title="Best Sellers"
          link="See All Best Sellers"
          products={bestSellers}
          loading={loading}
        />
        <ProductSection
          title="New Arrivals"
          link="See All New Arrivals"
          products={newArrivals}
          loading={loading}
        />
      </div>
    </div>
  )
}
