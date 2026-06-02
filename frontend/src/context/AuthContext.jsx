import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, setTokens, clearTokens } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Re-hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('petoopia_user')
    const token  = localStorage.getItem('petoopia_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  /** Register a new account. Throws on error. */
  const register = async ({ name, email, mobile, password }) => {
    await api.post('/users/register/', { name, email, mobile, password })
  }

  /** Login with email + password. Returns user object. Throws on error. */
  const login = async (email, password) => {
    const data = await api.post('/users/login/', { email, password })
    setTokens(data.access, data.refresh)
    localStorage.setItem('petoopia_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  /** Logout and clear all stored credentials. */
  const logout = () => {
    clearTokens()
    setUser(null)
  }

  /** Refresh the user object from the server (call after profile update). */
  const refreshUser = async () => {
    try {
      const profile = await api.get('/users/profile/')
      const updated = { ...user, ...profile }
      localStorage.setItem('petoopia_user', JSON.stringify(updated))
      setUser(updated)
      return updated
    } catch {
      // If token expired, log out
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
