"""API Dependencies - FastAPI 의존성 주입."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.application.interfaces.jwt_service import JWTService
from app.config.settings import Settings, get_settings
from app.domain.entities.user import User
from app.domain.exceptions.auth import InvalidCredentialsError, TokenExpiredError
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.database.connection import get_supabase_client
from app.infrastructure.external.jwt_service import JWTServiceImpl
from app.infrastructure.repositories.supabase_user_repository import (
    SupabaseUserRepository,
)
from app.infrastructure.repositories.supabase_watch_history_repository import (
    SupabaseWatchHistoryRepository,
)
from app.application.interfaces.oauth_service import OAuthService
from app.infrastructure.external.google_oauth_service import GoogleOAuthService
from app.domain.repositories.watch_history_repository import WatchHistoryRepository
from app.domain.repositories.favorite_repository import FavoriteRepository
from app.infrastructure.repositories.supabase_favorite_repository import (
    SupabaseFavoriteRepository,
)

# Bearer 토큰 인증 스키마
security = HTTPBearer()


def get_user_repository() -> UserRepository:
    """사용자 리포지토리를 반환합니다."""
    client = get_supabase_client()
    return SupabaseUserRepository(client)


def get_jwt_service() -> JWTService:
    """JWT 서비스를 반환합니다."""
    settings = get_settings()
    return JWTServiceImpl(settings)


def get_google_oauth_service() -> OAuthService:
    """Google OAuth 서비스를 반환합니다."""
    settings = get_settings()
    return GoogleOAuthService(settings)


def get_watch_history_repository() -> WatchHistoryRepository:
    """시청 기록 리포지토리를 반환합니다."""
    client = get_supabase_client()
    return SupabaseWatchHistoryRepository(client)


def get_favorite_repository() -> FavoriteRepository:
    """즐겨찾기 리포지토리를 반환합니다."""
    client = get_supabase_client()
    return SupabaseFavoriteRepository(client)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    jwt_service: JWTService = Depends(get_jwt_service),
    user_repository: UserRepository = Depends(get_user_repository),
) -> User:
    """현재 인증된 사용자를 반환합니다.

    Args:
        credentials: Bearer 토큰
        jwt_service: JWT 서비스
        user_repository: 사용자 리포지토리

    Returns:
        User: 현재 인증된 사용자

    Raises:
        401: 인증 실패
    """
    try:
        # 토큰 검증
        payload = jwt_service.verify_access_token(credentials.credentials)
        user_id = payload.get("sub")

        if not user_id:
            raise InvalidCredentialsError()

        # 사용자 조회
        user = await user_repository.find_by_id(UUID(user_id))

        if not user:
            raise InvalidCredentialsError("사용자를 찾을 수 없습니다.")

        if not user.can_login():
            raise InvalidCredentialsError("계정이 비활성화되었습니다.")

        return user

    except (TokenExpiredError, InvalidCredentialsError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": e.code, "message": e.message},
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """활성화된 현재 사용자를 반환합니다."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "INACTIVE_USER", "message": "계정이 비활성화되었습니다."},
        )
    return current_user


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """관리자 권한을 가진 현재 사용자를 반환합니다."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "관리자 권한이 필요합니다."},
        )
    return current_user
