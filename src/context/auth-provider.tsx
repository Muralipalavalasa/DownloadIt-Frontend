import { useEffect, useState, type ReactNode } from 'react'

import { AuthContext } from './auth-context'
import {
  getCurrentUser as fetchCurrentUser,
  login as requestLogin,
  register as requestRegister,
} from '../lib/api'
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/authStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Awaited<ReturnType<typeof fetchCurrentUser>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const restoreSession = async () => {
      if (!getAccessToken()) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        if (isActive) {
          setUser(currentUser)
        }
      } catch {
        clearAccessToken()
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void restoreSession()
    return () => {
      isActive = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const tokenResponse = await requestLogin(email, password)
    setAccessToken(tokenResponse.access_token)
    try {
      setUser(await fetchCurrentUser())
    } catch (error) {
      clearAccessToken()
      throw error
    }
  }

  const logout = () => {
    clearAccessToken()
    setUser(null)
  }

  const register = (email: string, password: string) => requestRegister(email, password)

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  )
}