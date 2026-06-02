import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const [email,      setEmail]      = useState('')
  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent,       setSent]       = useState(false)

  const validate = () => {
    if (!email.trim()) return 'Enter your email or mobile number.'
    if (email.includes('@') && !/\S+@\S+\.\S+/.test(email))
      return 'Enter a valid email address.'
    return ''
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setSubmitting(true)
    // TODO: connect to backend reset endpoint
    setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 1000)
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      {/* Top logo bar */}
      <div className="auth-topbar">
        <Link to="/" className="auth-logo">
          <span className="auth-logo__paw">🐾</span>
          <span className="auth-logo__text">PETOOPIA</span>
        </Link>
      </div>

      {/* Card */}
      <div className="auth-card">

        {!sent ? (
          /* ── Step 1: enter email ── */
          <>
            <div className="fp-icon" aria-hidden="true">🔑</div>
            <h1 className="auth-card__title">Forgot password?</h1>
            <p className="auth-card__sub">
              Enter the email or mobile number linked to your account and we'll
              send you a password reset link.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className={`auth-field ${error ? 'auth-field--error' : ''}`}>
                <label className="auth-label" htmlFor="fp-email">
                  Email or mobile number
                </label>
                <input
                  id="fp-email"
                  type="text"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  autoFocus
                />
                {error && <p className="auth-error">{error}</p>}
              </div>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="fp-back">
              <Link to="/signin" className="fp-back__link">← Back to Sign In</Link>
            </div>
          </>
        ) : (
          /* ── Step 2: success state ── */
          <div className="fp-success">
            <div className="fp-success__icon" aria-hidden="true">✉️</div>
            <h2 className="fp-success__title">Check your inbox</h2>
            <p className="fp-success__body">
              We've sent a password reset link to{' '}
              <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <p className="fp-success__hint">
              Didn't receive it? Check your spam folder or{' '}
              <button
                className="fp-resend"
                onClick={() => { setSent(false); setSubmitting(false) }}
              >
                try again
              </button>
              .
            </p>
            <Link to="/reset-password" className="auth-submit fp-success__btn">
              Set new password →
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="auth-footer">
        <a href="#">Conditions of Use</a>
        <a href="#">Privacy Notice</a>
        <a href="#">Help</a>
        <p>© {new Date().getFullYear()} Petoopia</p>
      </div>
    </div>
  )
}
