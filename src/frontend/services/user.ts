/**
 * User Service - 사용자 API 서비스
 */

import { api } from '@/lib/api'
import type { UserProfile, UserUpdateRequest } from '@/types/auth'

export const userService = {
  /**
   * 내 프로필 조회
   */
  getMe: (token: string) =>
    api.get<UserProfile>('/v1/users/me', { token }),

  /**
   * 내 프로필 수정
   */
  updateMe: (data: UserUpdateRequest, token: string) =>
    api.patch<UserProfile>('/v1/users/me', data, { token }),
}
