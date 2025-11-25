import type { Metadata } from 'next'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HallyuLatino',
    template: '%s | HallyuLatino',
  },
  description: '라틴 아메리카를 위한 AI 기반 한류 콘텐츠 플랫폼',
  keywords: ['K-Drama', 'K-Pop', 'K-Beauty', '한류', 'Latino', 'streaming'],
  authors: [{ name: 'HallyuLatino Team' }],
  openGraph: {
    type: 'website',
    locale: 'es_LA',
    url: 'https://hallyulatino.com',
    siteName: 'HallyuLatino',
    title: 'HallyuLatino',
    description: '라틴 아메리카를 위한 AI 기반 한류 콘텐츠 플랫폼',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
