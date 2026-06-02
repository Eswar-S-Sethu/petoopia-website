import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { allProducts as staticAllProducts } from '../../data/products'
import { api, convertProduct } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './ProductDetail.css'

/* ── Star rating ── */
function Stars({ rating, large }) {
  return (
    <div className={`pd-stars ${large ? 'pd-stars--large' : ''}`} aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`pd-star ${
            i <= Math.floor(rating)
              ? 'pd-star--full'
              : i - 0.5 <= rating
              ? 'pd-star--half'
              : 'pd-star--empty'
          }`}
        >★</span>
      ))}
    </div>
  )
}

/* ── Related product card ── */
function RelatedCard({ product }) {
  const { user }      = useAuth()
  const { addToCart } = useCart()
  const navigate      = useNavigate()
  const [added, setAdded] = useState(false)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAdd = async () => {
    if (!user) { navigate('/signin'); return }
    setAdded(true)
    await addToCart(product)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="pd-related-card">
      {product.badge && (
        <span className={`pd-related-badge pd-related-badge--${product.badge.toLowerCase().replace(' ', '-')}`}>
          {product.badge}
        </span>
      )}
      <Link to={`/product/${product.id}`} className="pd-related-img-link">
        <div className="pd-related-img">
          <span aria-hidden="true">{product.emoji}</span>
        </div>
      </Link>
      <div className="pd-related-info">
        <p className="pd-related-category">{product.category}</p>
        <Link to={`/product/${product.id}`} className="pd-related-name-link">
          <h3 className="pd-related-name">{product.name}</h3>
        </Link>
        <div className="pd-related-rating-row">
          <Stars rating={product.rating} />
          <span className="pd-related-reviews">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="pd-related-price-row">
          <span className="pd-related-price">${product.price.toFixed(2)}</span>
          <span className="pd-related-original">${product.originalPrice.toFixed(2)}</span>
          <span className="pd-related-discount">{discount}% off</span>
        </div>
        <button
          className={`pd-related-atc ${added ? 'pd-related-atc--added' : ''}`}
          onClick={handleAdd}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

/* ── Mock reviews ── */
const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Sarah T.',
    date: 'March 2025',
    rating: 5,
    text: 'Absolutely love this product! My pet took to it straight away and the quality is exactly as described. Will definitely be ordering again — fast shipping too.',
  },
  {
    id: 2,
    name: 'James W.',
    date: 'February 2025',
    rating: 4,
    text: 'Great value for money. It does exactly what it says on the tin. I\'ve tried a few similar products before and this one is noticeably better. Only minor gripe is the packaging could be improved.',
  },
  {
    id: 3,
    name: 'Priya M.',
    date: 'January 2025',
    rating: 5,
    text: 'My vet recommended this and I can see why. After just a few weeks I\'ve noticed a real difference. The whole family is happy — especially the pet! Highly recommend to anyone looking for a reliable option.',
  },
]

/* ── Main component ── */
export default function ProductDetail() {
  const { id }                       = useParams()
  const { user }                     = useAuth()
  const { addToCart, addToWishlist } = useCart()
  const navigate                     = useNavigate()

  // Start with static fallback so the page works without the backend
  const [product,     setProduct]     = useState(
    () => staticAllProducts.find(p => p.id === parseInt(id)) ?? null
  )
  const [apiLoading,  setApiLoading]  = useState(true)
  const [relatedAll,  setRelatedAll]  = useState(staticAllProducts)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [prodData, allData] = await Promise.all([
          api.get(`/products/${id}/`),
          api.get('/products/'),
        ])
        if (cancelled) return
        setProduct(convertProduct(prodData))
        setRelatedAll(allData.map(convertProduct))
      } catch {
        // Backend unavailable — static fallback stays
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const weightOptions = product?.specs?.Weight
    ? product.specs.Weight.split(',').map(w => w.trim())
    : []
  const [selectedWeight, setSelectedWeight] = useState(() =>
    product?.specs?.Weight ? product.specs.Weight.split(',')[0].trim() : ''
  )
  const [cartAdded, setCartAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  /* ── Not found (API returned, nothing matched) ── */
  if (!apiLoading && !product) {
    return (
      <>
        <Navbar />
        <div className="pd-not-found">
          <span className="pd-not-found__emoji">🐾</span>
          <h2 className="pd-not-found__title">Product Not Found</h2>
          <p className="pd-not-found__sub">We couldn't find the product you're looking for.</p>
          <Link to="/" className="pd-not-found__btn">Back to Home</Link>
        </div>
        <Footer />
      </>
    )
  }

  /* ── Loading (API still in flight, no static fallback for this id) ── */
  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pd-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--gray-400)', fontFamily: 'var(--font-body)' }}>Loading product…</p>
        </div>
        <Footer />
      </>
    )
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const relatedProducts = relatedAll
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = async () => {
    if (!user) { navigate('/signin'); return }
    setCartAdded(true)
    await addToCart(product, qty)
    setTimeout(() => setCartAdded(false), 1800)
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/signin'); return }
    if (wishlisted) return
    await addToWishlist(product)
    setWishlisted(true)
  }

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <div className="container">
          <Link to="/" className="pd-breadcrumb__link">Home</Link>
          <span className="pd-breadcrumb__sep">›</span>
          <span className="pd-breadcrumb__link pd-breadcrumb__link--cat">{product.category}</span>
          <span className="pd-breadcrumb__sep">›</span>
          <span className="pd-breadcrumb__current">{product.name}</span>
        </div>
      </div>

      <div className="pd-page">
        <div className="container">

          {/* ── Top two-column layout ── */}
          <div className="pd-top">

            {/* Left: image gallery */}
            <div className="pd-gallery">
              <div className="pd-gallery__main">
                <span className="pd-gallery__emoji" aria-hidden="true">{product.emoji}</span>
              </div>
            </div>

            {/* Right: product info */}
            <div className="pd-info">

              {/* Category badge */}
              <span className="pd-category-badge">{product.category}</span>

              {/* Product name */}
              <h1 className="pd-name">{product.name}</h1>

              {/* Rating row */}
              <div className="pd-rating-row">
                <Stars rating={product.rating} large />
                <span className="pd-rating-score">{product.rating}</span>
                <span className="pd-rating-count">· {product.reviews.toLocaleString()} reviews</span>
              </div>

              {/* Divider */}
              <div className="pd-divider" />

              {/* Price block */}
              <div className="pd-price-block">
                <span className="pd-price">${product.price.toFixed(2)}</span>
                <span className="pd-original">${product.originalPrice.toFixed(2)}</span>
                <span className="pd-discount-badge">{discount}% off</span>
              </div>
              <p className="pd-currency">AUD</p>

              {/* Stock status */}
              <p className={`pd-stock ${product.inStock ? 'pd-stock--in' : 'pd-stock--out'}`}>
                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </p>

              {/* Delivery banner */}
              <div className="pd-delivery-banner">
                🚚 Free delivery on orders over $50
              </div>

              {/* Divider */}
              <div className="pd-divider" />

              {/* Qty + Weight selectors */}
              <div className="pd-qty-row">
                <span className="pd-qty-label">Quantity</span>
                <div className="pd-qty-wrap">
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                  >−</button>
                  <span className="pd-qty-val">{qty}</span>
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQty(q => q + 1)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>

                {weightOptions.length > 0 && (
                  <>
                    <span className="pd-qty-label" style={{ marginLeft: '1.5rem' }}>Weight</span>
                    <select
                      className="pd-weight-select"
                      value={selectedWeight}
                      onChange={e => setSelectedWeight(e.target.value)}
                      aria-label="Select weight"
                    >
                      {weightOptions.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* CTA buttons */}
              <button
                className={`pd-atc ${cartAdded ? 'pd-atc--added' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {cartAdded ? '✓ Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                className={`pd-wishlist ${wishlisted ? 'pd-wishlist--active' : ''}`}
                onClick={handleWishlist}
              >
                {wishlisted ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
              </button>

              {/* Highlights */}
              <div className="pd-divider" />
              <ul className="pd-highlights">
                {product.highlights.map((h, i) => (
                  <li key={i} className="pd-highlight-item">
                    <span className="pd-highlight-check">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="pd-tabs">
            <div className="pd-tab-bar">
              {['description', 'specifications', 'reviews'].map(tab => (
                <button
                  key={tab}
                  className={`pd-tab-btn ${activeTab === tab ? 'pd-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="pd-tab-content">
              {/* Description */}
              {activeTab === 'description' && (
                <div className="pd-tab-description">
                  {product.description.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {/* Specifications */}
              {activeTab === 'specifications' && (
                <div className="pd-tab-specs">
                  <table className="pd-specs-table">
                    <tbody>
                      {Object.entries(product.specs).map(([key, val]) => (
                        <tr key={key} className="pd-specs-row">
                          <td className="pd-specs-key">{key}</td>
                          <td className="pd-specs-val">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="pd-tab-reviews">
                  <div className="pd-reviews-summary">
                    <span className="pd-reviews-score">{product.rating}</span>
                    <div>
                      <Stars rating={product.rating} large />
                      <p className="pd-reviews-count">{product.reviews.toLocaleString()} reviews</p>
                    </div>
                  </div>
                  <div className="pd-reviews-list">
                    {MOCK_REVIEWS.map(review => (
                      <div key={review.id} className="pd-review">
                        <div className="pd-review__header">
                          <div>
                            <span className="pd-review__name">{review.name}</span>
                            <span className="pd-review__date">{review.date}</span>
                          </div>
                          <Stars rating={review.rating} />
                        </div>
                        <p className="pd-review__text">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div className="pd-related">
              <div className="section-label">
                <h2 className="section-label__title">Related Products</h2>
                <span className="section-label__line" />
              </div>
              <div className="pd-related-grid">
                {relatedProducts.map(p => (
                  <RelatedCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  )
}
