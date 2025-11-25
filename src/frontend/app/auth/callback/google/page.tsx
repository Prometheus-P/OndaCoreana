/**
 * Google OAuth Callback Page - Google OAuth 콜백 처리
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { authService } from '@/services/auth'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Google 로그인이 취소되었습니다.')
        return
      }

      if (!code || !state) {
        setError('잘못된 인증 요청입니다.')
        return
      }

      try {
        const response = await authService.googleCallback({ code, state })

        // 상태 업데이트 (login 메서드로 user와 tokens 설정)
        login(
          {
            id: response.user.id,
            email: response.user.email,
            nickname: response.user.nickname,
            preferredLanguage: response.user.preferredLanguage,
          },
          {
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            expiresIn: response.tokens.expiresIn,
          }
        )

        // 신규 사용자면 프로필 설정 페이지로, 기존 사용자면 홈으로
        if (response.isNewUser) {
          router.push('/profile/edit')
        } else {
          router.push('/')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.')
      }
    }

    handleCallback()
  }, [searchParams, router, login])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">로그인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">로그인 중...</h1>
        <p className="text-gray-600">Google 계정으로 로그인하고 있습니다.</p>
      </div>
    </div>
  )
}

function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">로딩 중...</h1>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <GoogleCallbackContent />
    </Suspense>
  )
}
