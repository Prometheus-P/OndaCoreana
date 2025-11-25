/**
 * Auth Layout - 인증 페이지 레이아웃
 */

import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="page-container py-4">
          <Link href="/" className="text-2xl font-bold text-gradient">
            HallyuLatino
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-gray-500">
        © 2025 HallyuLatino. All rights reserved.
      </footer>
    </div>
  )
}
