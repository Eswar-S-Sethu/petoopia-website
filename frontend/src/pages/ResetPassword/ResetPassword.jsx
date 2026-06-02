import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ResetPassword.css'

/* Same strength scorer as SignUp */
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

export default function ResetPassword() {
  const navigate = useNavigate()
  // TODO: read ?token= from URL with useSearchParams and send to backend
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)

  const strength = getStrength(password)

  const validate = () => {
    const e = {}
    if (!password)             e.password = 'Enter a new password.'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!confirm)              e.confirm  = 'Please confirm your new password.'
    else if (password !== confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    // TODO: POST { token, newPassword } to backend
    setTimeout(() => {
      setSubmitting(false)
      setDone(true)
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

        {!done ? (
          /* ── Step 1: set new password ── */
          <>
            <div className="fp-icon" aria-hidden="true">🔒</div>
            <h1 className="auth-card__title">Reset password</h1>
            <p className="auth-card__sub">
              Choose a strong new password for your Petoopia account.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              {/* New password */}
              <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
                <label className="auth-label" htmlFor="rp-password">New password</label>
                <div className="auth-pw-wrap">
                  <input
                    id="rp-password"
                    type={showPw ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password && (
                  <div className="auth-strength">
                    <div className="auth-strength__bar">
                      <div
                        className={`auth-strength__fill auth-strength__fill--${strength.level}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <span className={`auth-strength__label auth-strength__label--${strength.level}`}>
                      {strength.label}
                    </span>
                  </div>
                )}
                {errors.password && <p className="auth-error">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div className={`auth-field ${errors.confirm ? 'auth-field--error' : ''}`}>
                <label className="auth-label" htmlFor="rp-confirm">Confirm new password</label>
                <div className="auth-pw-wrap">
                  <input
                    id="rp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Same password again"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })) }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {/* Match indicator */}
                {confirm && (
                  <p className={`rp-match ${password === confirm ? 'rp-match--ok' : 'rp-match--no'}`}>
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
                {errors.confirm && <p className="auth-error">{errors.confirm}</p>}
              </div>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Reset password'}
              </button>
            </form>

            <div className="fp-back">
              <Link to="/signin" className="fp-back__link">← Back to Sign In</Link>
            </div>
          </>
        ) : (
          /* ── Step 2: success ── */
          <div className="fp-success">
            <div className="fp-success__icon" aria-hidden="true">✅</div>
            <h2 className="fp-success__title">Password reset!</h2>
            <p className="fp-success__body">
              Your password has been updated successfully. You can now sign in
              with your new password.
            </p>
            <button
              className="auth-submit fp-success__btn"
              onClick={() => navigate('/signin')}
            >
              Go to Sign In
            </button>
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
