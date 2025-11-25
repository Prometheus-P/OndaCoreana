/**
 * Auth Store - 인증 상태 관리
 *
 * Zustand를 사용한 인증 상태 관리 스토어입니다.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  nickname: string
  preferredLanguage: string
}

interface Tokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface AuthState {
  user: User | null
  tokens: Tokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setTokens: (tokens: Tokens | null) => void
  login: (user: User, tokens: Tokens) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setTokens: (tokens) =>
        set({ tokens }),

      login: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),

      setLoading: (isLoading) =>
        set({ isLoading }),
    }),
    {
      name: 'hallyulatino-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
