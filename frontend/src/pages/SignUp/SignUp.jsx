import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './SignUp.css'

function getStrength(pw) {
  if (!pw) return { level: 0, label: '', width: '0%' }
  if (pw.length < 6) return { level: 1, label: 'Too short', width: '20%' }
  const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/]
  const score = checks.filter(r => r.test(pw)).length + (pw.length >= 10 ? 1 : 0)
  if (score <= 2) return { level: 2, label: 'Weak',   width: '35%' }
  if (score === 3) return { level: 3, label: 'Fair',   width: '60%' }
  if (score === 4) return { level: 4, label: 'Good',   width: '80%' }
  return              { level: 5, label: 'Strong', width: '100%' }
}

export default function SignUp() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '', confirm: '',
  })
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed,      setAgreed]      = useState(false)
  const [errors,      setErrors]      = useState({})
  const [apiError,    setApiError]    = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const strength = getStrength(form.password)

  const set = key => e => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name     = 'Enter your full name.'
    if (!form.email.trim())  e.email    = 'Enter your email address.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.mobile.trim()) e.mobile   = 'Enter your mobile number.'
    else if (!/^\d{10}$/.test(form.mobile.replace(/\s/g, ''))) e.mobile = 'Enter a valid 10-digit mobile number.'
    if (!form.password)      e.password = 'Create a password.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!form.confirm)       e.confirm  = 'Re-enter your password.'
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    if (!agreed)             e.agreed   = 'You must agree to the terms to continue.'
    return e
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    setApiError('')
    try {
      await register({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        mobile:   form.mobile.trim(),
        password: form.password,
      })
      navigate('/signin')
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
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
        <h1 className="auth-card__title">Create account</h1>
        <p className="auth-card__sub">Join 500,000+ pet parents on Petoopia.</p>

        {apiError && <div className="auth-api-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
            <label className="auth-label" htmlFor="su-name">Full name</label>
            <input id="su-name" type="text" className="auth-input"
              placeholder="Your full name" value={form.name} onChange={set('name')}
              autoComplete="name" />
            {errors.name && <p className="auth-error">{errors.name}</p>}
          </div>

          <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
            <label className="auth-label" htmlFor="su-email">Email address</label>
            <input id="su-email" type="email" className="auth-input"
              placeholder="you@example.com" value={form.email} onChange={set('email')}
              autoComplete="email" />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className={`auth-field ${errors.mobile ? 'auth-field--error' : ''}`}>
            <label className="auth-label" htmlFor="su-mobile">Mobile number</label>
            <div className="auth-phone-wrap">
              <span className="auth-phone-prefix">🇦🇺 +61</span>
              <input id="su-mobile" type="tel" className="auth-input auth-input--phone"
                placeholder="04XX XXX XXX" value={form.mobile} onChange={set('mobile')}
                autoComplete="tel" maxLength={10} />
            </div>
            {errors.mobile && <p className="auth-error">{errors.mobile}</p>}
          </div>

          <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
            <label className="auth-label" htmlFor="su-password">Password</label>
            <div className="auth-pw-wrap">
              <input id="su-password" type={showPw ? 'text' : 'password'} className="auth-input"
                placeholder="At least 8 characters" value={form.password} onChange={set('password')}
                autoComplete="new-password" />
              <button type="button" className="auth-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength__bar">
                  <div className={`auth-strength__fill auth-strength__fill--${strength.level}`}
                    style={{ width: strength.width }} />
                </div>
                <span className={`auth-strength__label auth-strength__label--${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          <div className={`auth-field ${errors.confirm ? 'auth-field--error' : ''}`}>
            <label className="auth-label" htmlFor="su-confirm">Re-enter password</label>
            <div className="auth-pw-wrap">
              <input id="su-confirm" type={showConfirm ? 'text' : 'password'} className="auth-input"
                placeholder="Same password again" value={form.confirm} onChange={set('confirm')}
                autoComplete="new-password" />
              <button type="button" className="auth-pw-toggle"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirm && <p className="auth-error">{errors.confirm}</p>}
          </div>

          <div className={`auth-terms ${errors.agreed ? 'auth-terms--error' : ''}`}>
            <label className="auth-terms__label">
              <input type="checkbox" className="auth-terms__check"
                checked={agreed}
                onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: '' })) }} />
              <span>
                I agree to Petoopia's{' '}
                <a href="#" className="auth-terms__link">Conditions of Use</a>{' '}
                and{' '}
                <a href="#" className="auth-terms__link">Privacy Notice</a>.
              </span>
            </label>
            {errors.agreed && <p className="auth-error">{errors.agreed}</p>}
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create your Petoopia account'}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider__line" />
          <span className="auth-divider__text">Already have an account?</span>
          <span className="auth-divider__line" />
        </div>

        <Link to="/signin" className="auth-secondary-btn">
          Sign in instead
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
