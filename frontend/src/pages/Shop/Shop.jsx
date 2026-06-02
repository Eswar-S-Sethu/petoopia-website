import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { api, convertProduct } from '../../services/api'
import { allProducts as staticProducts } from '../../data/products'
import './Shop.css'

const CATEGORIES = ['All', 'Dogs', 'Cats', 'Birds']
const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'name',       label: 'Name: A–Z' },
]

function Stars({ rating }) {
  return (
    <div className="sp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`sp-star ${
          i <= Math.floor(rating) ? 'sp-star--full' :
          i - 0.5 <= rating      ? 'sp-star--half' :
                                   'sp-star--empty'
        }`}>★</span>
      ))}
    </div>
  )
}

function ShopCard({ product }) {
  const { user }                   = useAuth()
  const { addToCart, addToWishlist } = useCart()
  const navigate                   = useNavigate()
  const [added,      setAdded]      = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleCart = async () => {
    if (!user) { navigate('/signin'); return }
    setAdded(true)
    await addToCart(product)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/signin'); return }
    const ok = await addToWishlist(product)
    if (ok) { setWishlisted(true); setTimeout(() => setWishlisted(false), 2000) }
  }

  return (
    <div className="sp-card">
      {product.badge && (
        <span className={`sp-badge sp-badge--${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
          {product.badge}
        </span>
      )}

      <button
        className={`sp-wl-btn ${wishlisted ? 'sp-wl-btn--active' : ''}`}
        onClick={handleWishlist}
        aria-label="Add to Wishlist"
      >
        {wishlisted ? '♥' : '♡'}
      </button>

      <Link to={`/product/${product.id}`} className="sp-card__img-link">
        <div className="sp-card__img">
          <span>{product.emoji}</span>
        </div>
      </Link>

      <div className="sp-card__body">
        <p className="sp-card__cat">{product.category}</p>
        <Link to={`/product/${product.id}`} className="sp-card__name-link">
          <h3 className="sp-card__name">{product.name}</h3>
        </Link>

        <div className="sp-card__rating">
          <Stars rating={product.rating} />
          <span className="sp-card__reviews">({product.reviews?.toLocaleString()})</span>
        </div>

        <div className="sp-card__prices">
          <span className="sp-card__price">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="sp-card__original">${product.originalPrice.toFixed(2)}</span>
          )}
          {discount > 0 && <span className="sp-card__disc">{discount}% off</span>}
        </div>

        {!product.inStock && <p className="sp-card__oos">Out of Stock</p>}

        <button
          className={`sp-card__atc ${added ? 'sp-card__atc--done' : ''}`}
          onClick={handleCart}
          disabled={!product.inStock}
        >
          {added ? '✓ Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [allProducts, setAllProducts] = useState(staticProducts.map(p => ({
    ...p,
    inStock: p.inStock ?? true,
  })))
  const [loading,  setLoading]  = useState(true)
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [search,   setSearch]   = useState(searchParams.get('search') || '')
  const [sort,     setSort]     = useState('default')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get('/products/')
      .then(data => { if (!cancelled && data?.length) setAllProducts(data.map(convertProduct)) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Sync category/search from URL
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All')
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const handleCategory = cat => {
    setCategory(cat)
    const params = {}
    if (cat !== 'All') params.category = cat
    if (search)        params.search   = search
    setSearchParams(params)
  }

  const handleSearch = e => {
    const val = e.target.value
    setSearch(val)
    const params = {}
    if (category !== 'All') params.category = category
    if (val)                params.search   = val
    setSearchParams(params)
  }

  let filtered = allProducts
    .filter(p => category === 'All' || p.category === category)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  if (sort === 'price_asc')  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === 'rating')     filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  if (sort === 'name')       filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <Navbar />
      <div className="sp-page">

        {/* Breadcrumb */}
        <div className="pg-breadcrumb">
          <div className="container">
            <Link to="/" className="pg-breadcrumb__link">Home</Link>
            <span className="pg-breadcrumb__sep">›</span>
            <span>{category === 'All' ? 'Shop' : category}</span>
          </div>
        </div>

        <div className="container sp-inner">

          {/* Page header */}
          <div className="sp-head">
            <div>
              <h1 className="sp-title">
                {category === 'All' ? 'All Products' : `${category} Products`}
              </h1>
              {!loading && (
                <p className="sp-count">
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Filter bar */}
          <div className="sp-filters">
            <div className="sp-cats">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`sp-cat-btn ${category === cat ? 'sp-cat-btn--active' : ''}`}
                  onClick={() => handleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sp-controls">
              <input
                className="sp-search"
                placeholder="Search products…"
                value={search}
                onChange={handleSearch}
              />
              <select className="sp-sort" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="sp-skeleton-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="sp-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="sp-empty">
              <span className="sp-empty__emoji">🔍</span>
              <p className="sp-empty__title">No products found</p>
              <p className="sp-empty__sub">Try adjusting your filters or search term.</p>
              <button
                className="sp-empty__btn"
                onClick={() => { setSearch(''); setCategory('All'); setSearchParams({}) }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="sp-grid">
              {filtered.map(p => <ShopCard key={p.id} product={p} />)}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
