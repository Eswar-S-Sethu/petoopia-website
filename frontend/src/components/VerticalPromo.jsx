import React, { useState, useEffect, useCallback } from 'react'
import './VerticalPromo.css'

const slides = [
  {
    id: 0,
    tag: '🎉 FREE DELIVERY ON ORDERS OVER $50',
    headline: 'Everything Your Pet Deserves',
    sub: 'Premium nutrition, toys & accessories — curated for every breed, size & species.',
    cta: 'Shop All Pets',
    ctaSecondary: "Today's Deals",
    dark: true,
  },
  {
    id: 1,
    tag: '⚡ LIMITED TIME',
    headline: 'Up to 40% Off Pet Food',
    sub: "Stock up on your favourite brands. Prices this low won't last — deals end Sunday.",
    cta: 'See All Deals',
    ctaSecondary: 'Shop Food',
    dark: false,
  },
  {
    id: 2,
    tag: '✨ JUST LAUNCHED',
    headline: 'Vet-Approved Health Range',
    sub: 'Supplements, dental care & grooming essentials trusted and recommended by vets.',
    cta: 'Explore Range',
    ctaSecondary: 'Learn More',
    dark: true,
  },
]

export default function VerticalPromo() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading]   = useState(false)

  const goTo = useCallback((idx) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 320)
  }, [])

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % slides.length), 5500)
    return () => clearInterval(t)
  }, [current, goTo])

  const slide = slides[current]

  return (
    <div className={`vpromo ${slide.dark ? 'vpromo--dark' : 'vpromo--light'}`}>
      {/* dot-matrix background */}
      <div className="vpromo__bg-pattern" aria-hidden="true" />

      {/* Slide content */}
      <div className={`vpromo__body ${fading ? 'vpromo__body--fade' : ''}`}>
        <span className="vpromo__tag">{slide.tag}</span>
        <h3 className="vpromo__headline">{slide.headline}</h3>
        <p className="vpromo__sub">{slide.sub}</p>
        <div className="vpromo__ctas">
          <button
            className={`vpromo__btn vpromo__btn--primary ${slide.dark ? 'vpromo__btn--on-dark' : 'vpromo__btn--on-light'}`}
          >
            {slide.cta}
          </button>
          <button
            className={`vpromo__btn vpromo__btn--secondary ${slide.dark ? 'vpromo__btn--sec-dark' : 'vpromo__btn--sec-light'}`}
          >
            {slide.ctaSecondary}
          </button>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        className="vpromo__arrow vpromo__arrow--prev"
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
      >‹</button>
      <button
        className="vpromo__arrow vpromo__arrow--next"
        onClick={() => goTo((current + 1) % slides.length)}
        aria-label="Next slide"
      >›</button>

      {/* Dot indicators */}
      <div className="vpromo__dots" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            className={`vpromo__dot ${i === current ? 'vpromo__dot--active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
