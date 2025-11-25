/**
 * useProfile Hook - 프로필 관련 커스텀 훅
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { userService } from '@/services/user'
import type { UserProfile, UserUpdateRequest } from '@/types/auth'

const PROFILE_QUERY_KEY = ['profile']

export function useProfile() {
  const queryClient = useQueryClient()
  const { tokens, isAuthenticated, setUser } = useAuthStore()

  // 프로필 조회
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<UserProfile>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => {
      if (!tokens?.accessToken) {
        throw new Error('Not authenticated')
      }
      return userService.getMe(tokens.accessToken)
    },
    enabled: isAuthenticated && !!tokens?.accessToken,
    staleTime: 1000 * 60 * 5, // 5분
  })

  // 프로필 수정
  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) => {
      if (!tokens?.accessToken) {
        throw new Error('Not authenticated')
      }
      return userService.updateMe(data, tokens.accessToken)
    },
    onSuccess: (updatedProfile) => {
      // 캐시 업데이트
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile)
      // 스토어 업데이트
      setUser({
        id: updatedProfile.id,
        email: updatedProfile.email,
        nickname: updatedProfile.nickname,
        preferredLanguage: updatedProfile.preferredLanguage,
      })
    },
  })

  return {
    profile,
    isLoading,
    error: error as Error | null,
    updateProfile: (data: UserUpdateRequest) => updateMutation.mutateAsync(data),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as Error | null,
    refetch,
  }
}
