import React from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/products'
import './CategoryGrid.css'

export default function CategoryGrid() {
  return (
    <section className="cat-section">
      <div className="container">
        <div className="section-label">
          <h2 className="section-label__title">Shop by Pet</h2>
          <span className="section-label__line" />
          <Link to="/shop" className="section-label__link">View All →</Link>
        </div>

        <div className="cat-grid">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="cat-card"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="cat-card__emoji-wrap">
                <span className="cat-card__emoji" aria-hidden="true">{cat.emoji}</span>
              </div>
              <div className="cat-card__info">
                <h3 className="cat-card__name">{cat.name}</h3>
                <p className="cat-card__count">{cat.count}</p>
              </div>
              <span className="cat-card__arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
