/**
 * Profile Page - 프로필 페이지
 */

'use client'

import Link from 'next/link'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/common/Button'

export default function ProfilePage() {
  const { profile, isLoading, error } = useProfile()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error al cargar el perfil: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <Link href="/profile/edit">
          <Button variant="outline">Editar Perfil</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* 프로필 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.nickname}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.nickname.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.nickname}
              </h2>
              <p className="text-gray-500">{profile.email}</p>
              {profile.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  Verificado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 프로필 정보 */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Correo Electronico
              </label>
              <p className="mt-1 text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Nickname
              </label>
              <p className="mt-1 text-gray-900">{profile.nickname}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Pais
              </label>
              <p className="mt-1 text-gray-900">{profile.country || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Idioma Preferido
              </label>
              <p className="mt-1 text-gray-900">
                {profile.preferredLanguage === 'es'
                  ? 'Espanol'
                  : profile.preferredLanguage === 'pt'
                  ? 'Portugues'
                  : 'Ingles'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Rol
              </label>
              <p className="mt-1 text-gray-900 capitalize">{profile.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Miembro desde
              </label>
              <p className="mt-1 text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('es-LA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* 상태 정보 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-4 text-sm">
            <span
              className={`inline-flex items-center gap-1 ${
                profile.isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.isActive ? 'bg-green-600' : 'bg-red-600'
                }`}
              />
              {profile.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
