import { createContext, useContext, useState, useCallback } from 'react'
import * as api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialise from localStorage so a refresh keeps the user signed in.
  const [user, setUser] = useState(() => api.getStoredUser())
  const [token, setToken] = useState(() => api.getToken())

  const login = useCallback(async (creds) => {
    const data = await api.login(creds)
    setUser(data.user)
    setToken(data.token)
    return data
  }, [])

  const register = useCallback(async (creds) => {
    const data = await api.register(creds)
    setUser(data.user)
    setToken(data.token)
    return data
  }, [])

  const logout = useCallback(() => {
    api.clearAuth()
    setUser(null)
    setToken(null)
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
