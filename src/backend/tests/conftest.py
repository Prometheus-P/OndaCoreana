"""Test Configuration - pytest fixtures."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.config.settings import Settings
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.domain.value_objects.email import Email
from app.infrastructure.external.jwt_service import JWTServiceImpl


@pytest.fixture
def test_settings() -> Settings:
    """테스트용 설정을 반환합니다."""
    return Settings(
        app_env="development",
        database_url="postgresql://test:test@localhost:5432/test",
        redis_url="redis://localhost:6379/1",
        secret_key="test-secret-key-for-testing-only",
        supabase_url="https://test.supabase.co",
        supabase_service_key="test-service-key",
    )


@pytest.fixture
def jwt_service(test_settings: Settings) -> JWTServiceImpl:
    """JWT 서비스 인스턴스를 반환합니다."""
    return JWTServiceImpl(test_settings)


@pytest.fixture
def mock_user_repository() -> AsyncMock:
    """Mock 사용자 리포지토리를 반환합니다."""
    return AsyncMock(spec=UserRepository)


@pytest.fixture
def sample_user() -> User:
    """샘플 사용자 엔티티를 반환합니다."""
    return User(
        id=uuid4(),
        email=Email("maria@example.com"),
        password_hash="$2b$12$hashedpassword",
        nickname="Maria123",
        country="MX",
        preferred_language="es",
        is_active=True,
        is_verified=False,
        role="user",
    )


@pytest.fixture
def valid_registration_data() -> dict:
    """유효한 회원가입 데이터를 반환합니다."""
    return {
        "email": "newuser@example.com",
        "password": "SecureP@ss1",
        "nickname": "NewUser",
        "country": "MX",
        "preferred_language": "es",
    }


@pytest.fixture
def valid_login_data() -> dict:
    """유효한 로그인 데이터를 반환합니다."""
    return {
        "email": "maria@example.com",
        "password": "SecureP@ss1",
    }
