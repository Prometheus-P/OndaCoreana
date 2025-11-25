/**
 * Auth Service - 인증 API 서비스
 */

import { api } from '@/lib/api'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  TokenResponse,
  OAuthAuthorizationUrl,
  OAuthCallbackRequest,
  OAuthLoginResponse,
} from '@/types/auth'

export const authService = {
  /**
   * 회원가입
   */
  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/v1/auth/register', data),

  /**
   * 로그인
   */
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/v1/auth/login', data),

  /**
   * 토큰 갱신
   */
  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/v1/auth/refresh', null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ refresh_token: refreshToken }).toString(),
    }),

  /**
   * Google OAuth 인증 URL 가져오기
   */
  getGoogleAuthUrl: () =>
    api.get<OAuthAuthorizationUrl>('/v1/auth/oauth/google'),

  /**
   * Google OAuth 콜백 처리
   */
  googleCallback: (data: OAuthCallbackRequest) =>
    api.post<OAuthLoginResponse>('/v1/auth/oauth/google/callback', data),
}
