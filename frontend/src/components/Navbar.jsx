import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

/* ── Inline SVG icons ── */
const SearchIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const CartIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const MenuIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const NAV_LINKS = [
  { label: 'Dogs',         path: '/shop?category=Dogs' },
  { label: 'Cats',         path: '/shop?category=Cats' },
  { label: 'Birds',        path: '/shop?category=Birds' },
  { label: "Today's Deals", path: '/shop' },
  { label: 'New Arrivals', path: '/shop' },
  { label: 'Vet Essentials', path: '/shop' },
  { label: 'Grooming',    path: '/shop' },
  { label: 'Accessories', path: '/shop' },
]

export default function Navbar() {
  const { user } = useAuth()
  const { cartCount, wishlistCount } = useCart()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [query,    setQuery]    = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        {/* ── Primary bar ── */}
        <div className="nav__primary">
          <div className="container nav__primary-inner">

            {/* Logo */}
            <Link to="/" className="nav__logo">
              <span className="nav__logo-paw">🐾</span>
              <span className="nav__logo-text">PETOOPIA</span>
            </Link>

            {/* Deliver to */}
            <button className="nav__location">
              <PinIcon />
              <div>
                <p className="nav__location-label">Deliver to</p>
                <p className="nav__location-val">Australia ▾</p>
              </div>
            </button>

            {/* Search */}
            <form className="nav__search" onSubmit={handleSearch}>
              <select className="nav__search-cat" aria-label="Search category">
                <option>All</option>
                <option>Dogs</option>
                <option>Cats</option>
                <option>Birds</option>
              </select>
              <span className="nav__search-sep" />
              <input
                type="text"
                className="nav__search-input"
                placeholder="Search Petoopia…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="submit" className="nav__search-btn" aria-label="Search">
                <SearchIcon />
              </button>
            </form>

            {/* Right actions */}
            <div className="nav__actions">
              {user ? (
                <Link to="/account" className="nav__action nav__action--link">
                  <span className="nav__action-sub">Hello, {user.name?.split(' ')[0]}</span>
                  <span className="nav__action-main">Account &amp; Lists ▾</span>
                </Link>
              ) : (
                <Link to="/signin" className="nav__action nav__action--link">
                  <span className="nav__action-sub">Hello, Sign in</span>
                  <span className="nav__action-main">Account &amp; Lists ▾</span>
                </Link>
              )}

              <Link to="/account" className="nav__action nav__action--link">
                <span className="nav__action-sub">Returns</span>
                <span className="nav__action-main">&amp; Orders</span>
              </Link>

              <Link to="/wishlist" className="nav__action nav__action--row nav__wishlist">
                <div className="nav__wishlist-wrap">
                  <HeartIcon />
                  {wishlistCount > 0 && (
                    <span className="nav__wl-badge">{wishlistCount}</span>
                  )}
                </div>
                <span className="nav__action-main">Wishlist</span>
              </Link>

              <Link to="/cart" className="nav__cart" aria-label={`Cart — ${cartCount} items`}>
                <span className="nav__cart-badge">{cartCount}</span>
                <CartIcon />
                <span className="nav__cart-label">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Secondary bar ── */}
        <nav className="nav__secondary" aria-label="Category navigation">
          <div className="container nav__secondary-inner">
            <button className="nav__all-btn" onClick={() => navigate('/shop')}>
              <MenuIcon /><span>All</span>
            </button>
            {NAV_LINKS.map(link => (
              <Link key={link.label} to={link.path} className="nav__link">{link.label}</Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Push content below fixed header */}
      <div className="nav__spacer" aria-hidden="true" />
    </>
  )
}
