/**
 * Protected Layout - 인증이 필요한 페이지 레이아웃
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, logout } = useAuthStore()

  useEffect(() => {
    // 로딩이 완료된 후 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              HallyuLatino
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                Inicio
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900"
              >
                Mi Perfil
              </Link>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Cerrar Sesion
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-medium">
                  {user?.nickname?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.nickname}
                </span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main>{children}</main>
    </div>
  )
}
