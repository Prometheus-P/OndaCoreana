/**
 * Profile Edit Page - 프로필 편집 페이지
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { UserUpdateRequest } from '@/types/auth'

const COUNTRIES = [
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'CL', name: 'Chile' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'Republica Dominicana' },
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'Espana' },
]

const LANGUAGES = [
  { code: 'es', name: 'Espanol' },
  { code: 'pt', name: 'Portugues' },
  { code: 'en', name: 'Ingles' },
]

export default function ProfileEditPage() {
  const router = useRouter()
  const { profile, isLoading, updateProfile, isUpdating, updateError } = useProfile()

  const [formData, setFormData] = useState<UserUpdateRequest>({
    nickname: '',
    country: '',
    preferredLanguage: 'es',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  // 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname,
        country: profile.country || '',
        preferredLanguage: (profile.preferredLanguage as 'es' | 'pt' | 'en') || 'es',
      })
    }
  }, [profile])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nickname?.trim()) {
      newErrors.nickname = 'El nickname es requerido'
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = 'El nickname debe tener entre 2 y 20 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    if (!validate()) return

    try {
      await updateProfile(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch {
      // 에러는 updateError에서 처리됨
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/profile"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">
            Perfil actualizado correctamente. Redirigiendo...
          </p>
        </div>
      )}

      {updateError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            Error al actualizar el perfil: {updateError.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* 아바타 섹션 */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.nickname}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center text-white text-xl font-bold">
                {formData.nickname?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <p className="text-sm text-gray-500">
              La foto de perfil se puede cambiar desde la configuracion de tu cuenta de Google
            </p>
          </div>
        </div>

        {/* 닉네임 */}
        <div className="mb-4">
          <Input
            label="Nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            error={errors.nickname}
            maxLength={20}
          />
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className="mb-4">
          <Input
            label="Correo Electronico"
            value={profile?.email || ''}
            disabled
            helperText="El correo electronico no se puede cambiar"
          />
        </div>

        {/* 국가 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pais
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Selecciona tu pais</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* 언어 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Idioma Preferido
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

        {/* 버튼 */}
        <div className="flex gap-4">
          <Button type="submit" isLoading={isUpdating}>
            Guardar Cambios
          </Button>
          <Link href="/profile">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
