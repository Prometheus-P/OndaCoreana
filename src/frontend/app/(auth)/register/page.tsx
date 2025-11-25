/**
 * Register Page - 회원가입 페이지
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

const COUNTRIES = [
  { code: 'MX', name: 'México' },
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Ecuador' },
]

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
]

export default function RegisterPage() {
  const { register, loginWithGoogle, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    country: 'MX',
    preferredLanguage: 'es' as 'es' | 'pt' | 'en',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.'
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다.'
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = '비밀번호에 대문자가 포함되어야 합니다.'
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = '비밀번호에 소문자가 포함되어야 합니다.'
    } else if (!/\d/.test(formData.password)) {
      errors.password = '비밀번호에 숫자가 포함되어야 합니다.'
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = '비밀번호에 특수문자가 포함되어야 합니다.'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (!formData.nickname) {
      errors.nickname = '닉네임을 입력해주세요.'
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      errors.nickname = '닉네임은 2-20자 사이여야 합니다.'
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = '이용약관에 동의해주세요.'
    }

    if (!formData.agreePrivacy) {
      errors.agreePrivacy = '개인정보처리방침에 동의해주세요.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        country: formData.country,
        preferredLanguage: formData.preferredLanguage,
      })
    } catch (err) {
      // 에러는 useAuth에서 처리됨
    }
  }

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
        <p className="text-gray-600">HallyuLatino 멤버가 되어보세요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error instanceof Error ? error.message : '회원가입에 실패했습니다.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="이메일"
          type="email"
          name="email"
          placeholder="maria@example.com"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          autoComplete="email"
        />

        <Input
          label="비밀번호"
          type="password"
          name="password"
          placeholder="8자 이상, 대소문자+숫자+특수문자"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          helperText="8자 이상, 대소문자, 숫자, 특수문자 포함"
          autoComplete="new-password"
        />

        <Input
          label="비밀번호 확인"
          type="password"
          name="confirmPassword"
          placeholder="비밀번호를 다시 입력해주세요"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          autoComplete="new-password"
        />

        <Input
          label="닉네임"
          type="text"
          name="nickname"
          placeholder="2-20자"
          value={formData.nickname}
          onChange={handleChange}
          error={formErrors.nickname}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              국가
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              선호 언어
            </label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              <span className="text-red-500">*</span>{' '}
              <Link href="/terms" className="text-pink-600 hover:underline">
                이용약관
              </Link>
              에 동의합니다
            </span>
          </label>
          {formErrors.agreeTerms && (
            <p className="text-sm text-red-600 ml-6">{formErrors.agreeTerms}</p>
          )}

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={formData.agreePrivacy}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              <span className="text-red-500">*</span>{' '}
              <Link href="/privacy" className="text-pink-600 hover:underline">
                개인정보처리방침
              </Link>
              에 동의합니다
            </span>
          </label>
          {formErrors.agreePrivacy && (
            <p className="text-sm text-red-600 ml-6">{formErrors.agreePrivacy}</p>
          )}

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeMarketing"
              checked={formData.agreeMarketing}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              마케팅 정보 수신에 동의합니다 (선택)
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          회원가입
        </Button>
      </form>

      {/* 소셜 로그인 */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700">Google로 가입하기</span>
          </button>
        </div>
      </div>

      {/* 로그인 링크 */}
      <p className="mt-8 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-pink-600 font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
