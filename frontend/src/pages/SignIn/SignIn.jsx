import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './SignIn.css'

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [errors,     setErrors]     = useState({})
  const [apiError,   setApiError]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim())    e.email    = 'Enter your email address.'
    if (!password)        e.password = 'Enter your password.'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    setApiError('')
    try {
      await login(email.trim().toLowerCase(), password)
      navigate('/')
    } catch (err) {
      setApiError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-topbar">
        <Link to="/" className="auth-logo">
          <span className="auth-logo__paw">🐾</span>
          <span className="auth-logo__text">PETOOPIA</span>
        </Link>
      </div>

      <div className="auth-card">
        <h1 className="auth-card__title">Sign In</h1>
        <p className="auth-card__sub">Welcome back — your pets are waiting.</p>

        {apiError && <div className="auth-api-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
            <label className="auth-label" htmlFor="signin-email">Email address</label>
            <input
              id="signin-email"
              type="text"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              autoComplete="email"
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="signin-password">Password</label>
              <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>
            <div className="auth-pw-wrap">
              <input
                id="signin-password"
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                placeholder="Your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                autoComplete="current-password"
              />
              <button type="button" className="auth-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider__line" />
          <span className="auth-divider__text">New to Petoopia?</span>
          <span className="auth-divider__line" />
        </div>

        <Link to="/signup" className="auth-secondary-btn">
          Create your Petoopia account
        </Link>
      </div>

      <div className="auth-footer">
        <a href="#">Conditions of Use</a>
        <a href="#">Privacy Notice</a>
        <a href="#">Help</a>
        <p>© {new Date().getFullYear()} Petoopia</p>
      </div>
    </div>
  )
}
