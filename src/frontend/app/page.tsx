'use client'

import Link from 'next/link'
import { Button } from '@/components/common/Button'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative page-container py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              HallyuLatino
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              라틴 아메리카를 위한 AI 기반 한류 콘텐츠 플랫폼
            </p>
            <p className="text-lg text-white/80 mb-10">
              K-Drama, K-Pop, K-Beauty 콘텐츠를 스페인어와 포르투갈어 자막으로 즐기세요.
              AI가 실시간으로 번역해 드립니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                  시작하기
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  로그인
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center mb-12">
            왜 HallyuLatino인가요?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            무료로 가입하고 한류 콘텐츠의 세계를 탐험하세요.
            AI 자막으로 언어 장벽 없이 즐길 수 있습니다.
          </p>
          <Link href="/register">
            <Button size="lg">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="page-container text-center">
          <p className="text-gray-400">
            © 2025 HallyuLatino. Made with ❤️ for Latin American K-Content Fans
          </p>
        </div>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: '🌐',
    title: '언어 장벽 해소',
    description: 'AI 실시간 번역으로 스페인어/포르투갈어 자막 제공',
  },
  {
    icon: '🎬',
    title: '큐레이션 콘텐츠',
    description: '라틴 취향에 맞춘 K-콘텐츠 추천',
  },
  {
    icon: '👥',
    title: '팬 커뮤니티',
    description: '다른 한류 팬들과 소통하고 교류하세요',
  },
  {
    icon: '🤖',
    title: 'AI 어시스턴트',
    description: '한류 정보 챗봇과 학습 도우미',
  },
]
