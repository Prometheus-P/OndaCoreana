"""Google OAuth Service - Google OAuth 서비스 구현."""

from urllib.parse import urlencode

import httpx

from app.application.interfaces.oauth_service import OAuthService, OAuthUserInfo
from app.config.settings import Settings
from app.domain.exceptions.auth import OAuthError


class GoogleOAuthService(OAuthService):
    """Google OAuth 서비스 구현.

    Google OAuth 2.0 인증을 처리합니다.
    """

    AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    def __init__(self, settings: Settings) -> None:
        self._client_id = settings.google_client_id
        self._client_secret = settings.google_client_secret
        self._redirect_uri = settings.google_redirect_uri

    @property
    def provider_name(self) -> str:
        """OAuth 제공자 이름."""
        return "google"

    def get_authorization_url(self, state: str) -> str:
        """Google OAuth 인증 URL을 반환합니다.

        Args:
            state: CSRF 방지를 위한 상태 값

        Returns:
            str: Google OAuth 인증 URL
        """
        params = {
            "client_id": self._client_id,
            "redirect_uri": self._redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{self.AUTHORIZATION_URL}?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> str:
        """인증 코드를 액세스 토큰으로 교환합니다.

        Args:
            code: OAuth 인증 코드

        Returns:
            str: OAuth 액세스 토큰

        Raises:
            OAuthError: 토큰 교환 실패
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.TOKEN_URL,
                    data={
                        "client_id": self._client_id,
                        "client_secret": self._client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": self._redirect_uri,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["access_token"]
            except httpx.HTTPStatusError as e:
                raise OAuthError(f"Google 토큰 교환 실패: {e.response.text}")
            except KeyError:
                raise OAuthError("Google 응답에 access_token이 없습니다.")
            except Exception as e:
                raise OAuthError(f"Google OAuth 오류: {str(e)}")

    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        """Google 액세스 토큰으로 사용자 정보를 조회합니다.

        Args:
            access_token: Google OAuth 액세스 토큰

        Returns:
            OAuthUserInfo: Google 사용자 정보

        Raises:
            OAuthError: 사용자 정보 조회 실패
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                response.raise_for_status()
                data = response.json()

                return OAuthUserInfo(
                    provider="google",
                    provider_id=data["id"],
                    email=data["email"],
                    name=data.get("name"),
                    avatar_url=data.get("picture"),
                )
            except httpx.HTTPStatusError as e:
                raise OAuthError(f"Google 사용자 정보 조회 실패: {e.response.text}")
            except KeyError as e:
                raise OAuthError(f"Google 응답에 필수 필드가 없습니다: {e}")
            except Exception as e:
                raise OAuthError(f"Google OAuth 오류: {str(e)}")
