/**
 * useAuth Hook - 인증 관련 커스텀 훅
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { authService } from '@/services/auth'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, tokens, isAuthenticated, login, logout, setLoading } = useAuthStore()

  // 회원가입
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      router.push('/login?registered=true')
    },
  })

  // 로그인
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(
        {
          id: data.user.id,
          email: data.user.email,
          nickname: data.user.nickname,
          preferredLanguage: data.user.preferredLanguage,
        },
        {
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          expiresIn: data.tokens.expiresIn,
        }
      )
      router.push('/')
    },
  })

  // 로그아웃
  const handleLogout = useCallback(() => {
    logout()
    queryClient.clear()
    router.push('/login')
  }, [logout, queryClient, router])

  // Google OAuth 로그인 시작
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true)
      const response = await authService.getGoogleAuthUrl()
      // state를 세션 스토리지에 저장 (CSRF 방지)
      sessionStorage.setItem('oauth_state', response.state)
      // Google OAuth 페이지로 리다이렉트
      window.location.href = response.authorizationUrl
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [setLoading])

  // 토큰 갱신
  const refreshTokens = useCallback(async () => {
    if (!tokens?.refreshToken) return null

    try {
      const newTokens = await authService.refresh(tokens.refreshToken)
      useAuthStore.getState().setTokens({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
      })
      return newTokens
    } catch {
      handleLogout()
      return null
    }
  }, [tokens, handleLogout])

  return {
    user,
    tokens,
    isAuthenticated,
    register: (data: RegisterRequest) => registerMutation.mutateAsync(data),
    login: (data: LoginRequest) => loginMutation.mutateAsync(data),
    loginWithGoogle,
    logout: handleLogout,
    refreshTokens,
    isLoading: registerMutation.isPending || loginMutation.isPending,
    error: registerMutation.error || loginMutation.error,
  }
}
