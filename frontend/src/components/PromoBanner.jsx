import React from 'react'
import './PromoBanner.css'

const banners = [
  {
    id: 1,
    tag: 'LOYALTY PROGRAM',
    headline: 'Earn Paw Points on Every Order',
    body: 'Join 500,000+ pet parents. Earn points, unlock exclusive rewards and member deals.',
    cta: 'Join Free',
    emoji: '🏆',
    dark: true,
  },
  {
    id: 2,
    tag: 'SUBSCRIBE & SAVE',
    headline: 'Never Run Out. Save 15%.',
    body: 'Auto-schedule deliveries for food & essentials. Cancel or pause anytime.',
    cta: 'Learn More',
    emoji: '🔄',
    dark: false,
  },
]

const trustItems = [
  { emoji: '🚚', title: 'Free Delivery',    desc: 'Orders above $50' },
  { emoji: '↩️',  title: 'Easy Returns',    desc: '30-day hassle-free' },
  { emoji: '🔒', title: 'Secure Payments',  desc: 'Cards, PayPal & more' },
  { emoji: '🩺', title: 'Vet Approved',     desc: 'Expert recommended' },
]

export default function PromoBanner() {
  return (
    <div className="promo-sidebar">

      {/* ── Trust items ── */}
      <div className="promo-trust">
        <h4 className="promo-trust__heading">Why Shop With Us</h4>
        <ul className="promo-trust__list">
          {trustItems.map(item => (
            <li key={item.title} className="promo-trust__item">
              <span className="promo-trust__emoji">{item.emoji}</span>
              <div>
                <p className="promo-trust__title">{item.title}</p>
                <p className="promo-trust__desc">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Promo cards ── */}
      <div className="promo-cards">
        {banners.map(b => (
          <div
            key={b.id}
            className={`promo-card ${b.dark ? 'promo-card--dark' : 'promo-card--light'}`}
          >
            <div className="promo-card__bg-pattern" />
            <span className="promo-card__emoji" aria-hidden="true">{b.emoji}</span>
            <span className="promo-card__tag">{b.tag}</span>
            <h3 className="promo-card__headline">{b.headline}</h3>
            <p className="promo-card__body">{b.body}</p>
            <button className={`promo-card__cta ${b.dark ? 'promo-card__cta--light' : 'promo-card__cta--dark'}`}>
              {b.cta} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
