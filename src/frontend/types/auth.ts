/**
 * Auth Types - 인증 관련 타입 정의
 */

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  country: string
  preferredLanguage: 'es' | 'pt' | 'en'
}

export interface RegisterResponse {
  id: string
  email: string
  nickname: string
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: UserBasicInfo
  tokens: TokenResponse
}

export interface UserBasicInfo {
  id: string
  email: string
  nickname: string
  preferredLanguage: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface UserProfile {
  id: string
  email: string
  nickname: string
  country: string
  preferredLanguage: string
  isActive: boolean
  isVerified: boolean
  role: string
  avatarUrl: string | null
  createdAt: string
}

export interface UserUpdateRequest {
  nickname?: string
  country?: string
  preferredLanguage?: 'es' | 'pt' | 'en'
  avatarUrl?: string
}

// OAuth Types
export interface OAuthAuthorizationUrl {
  authorizationUrl: string
  state: string
}

export interface OAuthCallbackRequest {
  code: string
  state: string
}

export interface OAuthLoginResponse {
  user: UserBasicInfo
  tokens: TokenResponse
  isNewUser: boolean
}
