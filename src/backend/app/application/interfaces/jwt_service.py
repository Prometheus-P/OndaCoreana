"""JWT Service Interface - JWT 서비스 인터페이스."""

from abc import ABC, abstractmethod
from typing import Any


class JWTService(ABC):
    """JWT 서비스 인터페이스.

    토큰 생성 및 검증을 담당하는 서비스 인터페이스입니다.
    """

    @property
    @abstractmethod
    def access_token_expire_seconds(self) -> int:
        """액세스 토큰 만료 시간 (초)."""
        pass

    @abstractmethod
    def create_access_token(
        self,
        user_id: str,
        email: str,
        role: str,
    ) -> str:
        """액세스 토큰을 생성합니다.

        Args:
            user_id: 사용자 ID
            email: 사용자 이메일
            role: 사용자 역할

        Returns:
            str: JWT 액세스 토큰
        """
        pass

    @abstractmethod
    def create_refresh_token(self, user_id: str) -> str:
        """리프레시 토큰을 생성합니다.

        Args:
            user_id: 사용자 ID

        Returns:
            str: JWT 리프레시 토큰
        """
        pass

    @abstractmethod
    def verify_access_token(self, token: str) -> dict[str, Any]:
        """액세스 토큰을 검증합니다.

        Args:
            token: JWT 토큰

        Returns:
            dict: 토큰 페이로드

        Raises:
            TokenExpiredError: 토큰이 만료된 경우
            InvalidCredentialsError: 토큰이 유효하지 않은 경우
        """
        pass

    @abstractmethod
    def verify_refresh_token(self, token: str) -> dict[str, Any]:
        """리프레시 토큰을 검증합니다.

        Args:
            token: JWT 토큰

        Returns:
            dict: 토큰 페이로드

        Raises:
            TokenExpiredError: 토큰이 만료된 경우
            InvalidCredentialsError: 토큰이 유효하지 않은 경우
        """
        pass
