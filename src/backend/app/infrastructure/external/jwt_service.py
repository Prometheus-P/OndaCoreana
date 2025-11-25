"""JWT Service Implementation - JWT 서비스 구현."""

from datetime import datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from app.application.interfaces.jwt_service import JWTService
from app.config.settings import Settings
from app.domain.exceptions.auth import InvalidCredentialsError, TokenExpiredError


class JWTServiceImpl(JWTService):
    """JWT 서비스 구현체.

    python-jose를 사용한 JWT 토큰 생성 및 검증.
    """

    def __init__(self, settings: Settings) -> None:
        self._secret_key = settings.secret_key
        self._algorithm = settings.algorithm
        self._access_token_expire_minutes = settings.access_token_expire_minutes
        self._refresh_token_expire_days = settings.refresh_token_expire_days

    @property
    def access_token_expire_seconds(self) -> int:
        """액세스 토큰 만료 시간 (초)."""
        return self._access_token_expire_minutes * 60

    def create_access_token(
        self,
        user_id: str,
        email: str,
        role: str,
    ) -> str:
        """액세스 토큰을 생성합니다."""
        expire = datetime.utcnow() + timedelta(
            minutes=self._access_token_expire_minutes
        )
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "type": "access",
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def create_refresh_token(self, user_id: str) -> str:
        """리프레시 토큰을 생성합니다."""
        expire = datetime.utcnow() + timedelta(days=self._refresh_token_expire_days)
        payload = {
            "sub": user_id,
            "type": "refresh",
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def verify_access_token(self, token: str) -> dict[str, Any]:
        """액세스 토큰을 검증합니다."""
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
            )
            if payload.get("type") != "access":
                raise InvalidCredentialsError("유효하지 않은 토큰 타입입니다.")
            return payload
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except JWTError:
            raise InvalidCredentialsError("유효하지 않은 토큰입니다.")

    def verify_refresh_token(self, token: str) -> dict[str, Any]:
        """리프레시 토큰을 검증합니다."""
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
            )
            if payload.get("type") != "refresh":
                raise InvalidCredentialsError("유효하지 않은 토큰 타입입니다.")
            return payload
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except JWTError:
            raise InvalidCredentialsError("유효하지 않은 토큰입니다.")
