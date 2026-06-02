import React, { useState, useEffect, useCallback } from 'react'
import './Hero.css'

const slides = [
  {
    id: 0,
    tag: '🎉 FREE DELIVERY ON ORDERS OVER ₹499',
    headline: 'EVERYTHING YOUR PET DESERVES',
    sub: 'Premium nutrition, toys & accessories — curated for every breed, size & species.',
    cta: 'Shop All Pets',
    ctaSecondary: "Today's Deals",
    dark: true,
    visual: ['🐕', '🐈', '🦜'],
  },
  {
    id: 1,
    tag: '⚡ LIMITED TIME',
    headline: 'UP TO 40% OFF PET FOOD',
    sub: 'Stock up on your favourite brands. Prices this low won\'t last — deals end Sunday.',
    cta: 'See All Deals',
    ctaSecondary: 'Shop Food',
    dark: false,
    visual: ['🍖', '🥩', '🐾'],
  },
  {
    id: 2,
    tag: '✨ JUST LAUNCHED',
    headline: 'VET-APPROVED HEALTH RANGE',
    sub: 'Supplements, dental care & grooming essentials trusted and recommended by vets.',
    cta: 'Explore Range',
    ctaSecondary: 'Learn More',
    dark: true,
    visual: ['💊', '🦷', '✂️'],
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading]   = useState(false)

  const goTo = useCallback((idx) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 350)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 5500)
    return () => clearInterval(t)
  }, [current, goTo])

  const slide = slides[current]

  return (
    <section className={`hero ${slide.dark ? 'hero--dark' : 'hero--light'}`}>
      {/* Background dot-matrix pattern */}
      <div className="hero__bg-pattern" />

      <div className={`hero__body ${fading ? 'hero__body--fade' : ''}`}>
        <div className="container hero__inner">
          {/* Text side */}
          <div className="hero__text">
            <span className="hero__tag">{slide.tag}</span>
            <h1 className="hero__headline">{slide.headline}</h1>
            <p className="hero__sub">{slide.sub}</p>
            <div className="hero__ctas">
              <button className={`hero__btn hero__btn--primary ${slide.dark ? 'hero__btn--on-dark' : 'hero__btn--on-light'}`}>
                {slide.cta}
              </button>
              <button className={`hero__btn hero__btn--secondary ${slide.dark ? 'hero__btn--sec-dark' : 'hero__btn--sec-light'}`}>
                {slide.ctaSecondary}
              </button>
            </div>
          </div>

          {/* Visual side */}
          <div className="hero__visual" aria-hidden="true">
            <div className="hero__visual-ring" />
            <div className="hero__emojis">
              {slide.visual.map((em, i) => (
                <span key={i} className={`hero__emoji hero__emoji--${i}`}>{em}</span>
              ))}
            </div>
            <div className="hero__brand-mark">🐾</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        className="hero__arrow hero__arrow--prev"
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
      >‹</button>
      <button
        className="hero__arrow hero__arrow--next"
        onClick={() => goTo((current + 1) % slides.length)}
        aria-label="Next slide"
      >›</button>

      <div className="hero__dots" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            role="tab"
            aria-selected={i === current}
          />
        ))}
      </div>
    </section>
  )
}
