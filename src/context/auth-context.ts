import { createContext } from 'react'

import type { UserResponse } from '../lib/api'

export interface AuthContextValue {
  user: UserResponse | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string) => Promise<UserResponse>
}

export const AuthContext = createContext<AuthContextValue | null>(null)