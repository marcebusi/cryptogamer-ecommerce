import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from '../lib/api'
import type { User } from '../types'

/* ── Types ─────────────────────────────────────────── */
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  login:          (email: string, password: string) => Promise<void>
  register:       (name: string, email: string, password: string) => Promise<void>
  logout:         () => void
  updateProfile:  (data: { name?: string; phone?: string; address?: string }) => Promise<void>
  changePassword: (current: string, next: string) => Promise<void>
  forgotPassword: (email: string) => Promise<string>
  resetPassword:  (token: string, password: string) => Promise<string>
}

/* ── Context ───────────────────────────────────────── */
const AuthContext = createContext<AuthContextType | null>(null)

/* ── Provider ──────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /* Restore session on mount */
  useEffect(() => {
    const token = localStorage.getItem('cg_token')
    if (!token) { setIsLoading(false); return }

    api.get<User>('/api/auth/me')
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('cg_token'))
      .finally(() => setIsLoading(false))
  }, [])

  const saveSession = (token: string, u: User) => {
    localStorage.setItem('cg_token', token)
    setUser(u)
  }

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.post<{ token: string; user: User }>(
      '/api/auth/login', { email, password }
    )
    saveSession(token, u)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: u } = await api.post<{ token: string; user: User }>(
      '/api/auth/register', { name, email, password }
    )
    saveSession(token, u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cg_token')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; address?: string }) => {
    const updated = await api.put<User>('/api/auth/me', data)
    setUser(updated)
  }, [])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.put('/api/auth/me/password', { currentPassword, newPassword })
  }, [])

  const forgotPassword = useCallback(async (email: string): Promise<string> => {
    const { message } = await api.post<{ message: string }>('/api/auth/forgot-password', { email })
    return message
  }, [])

  const resetPassword = useCallback(async (token: string, password: string): Promise<string> => {
    const { message } = await api.post<{ message: string }>('/api/auth/reset-password', { token, password })
    return message
  }, [])

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isAuthenticated: !!user,
      isAdmin:         user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
      isSuperAdmin:    user?.role === 'SUPERADMIN',
      login, register, logout,
      updateProfile, changePassword,
      forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Hook ──────────────────────────────────────────── */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
