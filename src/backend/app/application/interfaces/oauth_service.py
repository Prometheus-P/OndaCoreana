"""OAuth Service Interface - OAuth 서비스 인터페이스."""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class OAuthUserInfo:
    """OAuth 사용자 정보."""

    provider: str
    provider_id: str
    email: str
    name: str | None = None
    avatar_url: str | None = None


class OAuthService(ABC):
    """OAuth 서비스 인터페이스.

    소셜 로그인 인증을 담당하는 서비스 인터페이스입니다.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """OAuth 제공자 이름."""
        pass

    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        """OAuth 인증 URL을 반환합니다.

        Args:
            state: CSRF 방지를 위한 상태 값

        Returns:
            str: OAuth 인증 URL
        """
        pass

    @abstractmethod
    async def exchange_code_for_token(self, code: str) -> str:
        """인증 코드를 액세스 토큰으로 교환합니다.

        Args:
            code: OAuth 인증 코드

        Returns:
            str: OAuth 액세스 토큰

        Raises:
            OAuthError: 토큰 교환 실패
        """
        pass

    @abstractmethod
    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        """OAuth 액세스 토큰으로 사용자 정보를 조회합니다.

        Args:
            access_token: OAuth 액세스 토큰

        Returns:
            OAuthUserInfo: OAuth 사용자 정보

        Raises:
            OAuthError: 사용자 정보 조회 실패
        """
        pass
