import React from 'react'
import './Footer.css'

const footerCols = [
  {
    heading: 'Get to Know Us',
    links: ['About Petoopia', 'Careers', 'Press Releases', 'Petoopia Science', 'Blog'],
  },
  {
    heading: 'Connect With Us',
    links: ['Facebook', 'Instagram', 'Twitter / X', 'YouTube', 'Pinterest'],
  },
  {
    heading: 'Make Money With Us',
    links: ['Sell on Petoopia', 'Become an Affiliate', 'Advertise Your Brand', 'Vet Partnerships'],
  },
  {
    heading: 'Let Us Help You',
    links: ['Track Your Order', 'Returns & Replacements', 'Manage Subscriptions', 'Help Center', 'Pet Care FAQs'],
  },
]

export default function Footer() {
  return (
    <footer className="foot">
      {/* Back to top */}
      <button className="foot__back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to top
      </button>

      {/* Main footer */}
      <div className="foot__main">
        <div className="container foot__grid">
          {footerCols.map(col => (
            <div key={col.heading} className="foot__col">
              <h4 className="foot__col-heading">{col.heading}</h4>
              <ul className="foot__col-list">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="foot__col-link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="foot__divider" />

      {/* Bottom bar */}
      <div className="foot__bottom">
        <div className="container foot__bottom-inner">
          <div className="foot__logo">
            <span className="foot__logo-paw">🐾</span>
            <span className="foot__logo-text">PETOOPIA</span>
          </div>

          <div className="foot__bottom-links">
            <a href="#" className="foot__bottom-link">Conditions of Use</a>
            <a href="#" className="foot__bottom-link">Privacy Notice</a>
            <a href="#" className="foot__bottom-link">Interest-Based Ads</a>
          </div>

          <p className="foot__copyright">
            © {new Date().getFullYear()} Petoopia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
