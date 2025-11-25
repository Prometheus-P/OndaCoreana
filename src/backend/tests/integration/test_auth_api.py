"""인증 API 통합 테스트.

FastAPI TestClient를 사용한 API 엔드포인트 통합 테스트.
"""

import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.domain.entities.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password


@pytest.fixture
def client():
    """테스트 클라이언트를 반환합니다."""
    return TestClient(app)


@pytest.fixture
def mock_user():
    """테스트용 사용자를 생성합니다."""
    password = Password("SecureP@ss1")
    return User(
        id=uuid4(),
        email=Email("test@example.com"),
        password_hash=password.hash(),
        nickname="TestUser",
        country="MX",
        preferred_language="es",
        is_active=True,
        is_verified=False,
        role="user",
    )


class TestHealthCheck:
    """헬스체크 API 테스트."""

    def test_health_check_returns_healthy(self, client: TestClient):
        """헬스체크 엔드포인트가 healthy를 반환해야 한다."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_root_returns_api_info(self, client: TestClient):
        """루트 엔드포인트가 API 정보를 반환해야 한다."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "HallyuLatino" in data["message"]


class TestRegistrationAPI:
    """회원가입 API 테스트."""

    @patch("app.presentation.api.dependencies.get_user_repository")
    def test_register_with_valid_data(
        self,
        mock_get_repo,
        client: TestClient,
    ):
        """유효한 데이터로 회원가입이 성공해야 한다."""
        # Mock 설정
        mock_repo = AsyncMock()
        mock_repo.exists_by_email.return_value = False
        mock_repo.create.return_value = User(
            id=uuid4(),
            email=Email("newuser@example.com"),
            nickname="NewUser",
            country="MX",
            preferred_language="es",
        )
        mock_get_repo.return_value = mock_repo

        # 요청
        response = client.post(
            "/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecureP@ss1",
                "nickname": "NewUser",
                "country": "MX",
                "preferred_language": "es",
            },
        )

        # 검증
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["nickname"] == "NewUser"
        assert "message" in data

    def test_register_with_invalid_email_format(self, client: TestClient):
        """잘못된 이메일 형식으로 회원가입 시 400 에러를 반환해야 한다."""
        response = client.post(
            "/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "SecureP@ss1",
                "nickname": "Test",
                "country": "MX",
                "preferred_language": "es",
            },
        )

        assert response.status_code == 422  # Pydantic validation error

    def test_register_with_weak_password(self, client: TestClient):
        """약한 비밀번호로 회원가입 시 400 에러를 반환해야 한다."""
        response = client.post(
            "/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
                "nickname": "Test",
                "country": "MX",
                "preferred_language": "es",
            },
        )

        assert response.status_code == 422  # Pydantic validation (min_length)

    @patch("app.presentation.api.dependencies.get_user_repository")
    def test_register_with_duplicate_email(
        self,
        mock_get_repo,
        client: TestClient,
    ):
        """중복된 이메일로 회원가입 시 409 에러를 반환해야 한다."""
        # Mock 설정 - 이메일 이미 존재
        mock_repo = AsyncMock()
        mock_repo.exists_by_email.return_value = True
        mock_get_repo.return_value = mock_repo

        response = client.post(
            "/v1/auth/register",
            json={
                "email": "existing@example.com",
                "password": "SecureP@ss1",
                "nickname": "Test",
                "country": "MX",
                "preferred_language": "es",
            },
        )

        assert response.status_code == 409
        data = response.json()
        assert data["detail"]["code"] == "EMAIL_ALREADY_EXISTS"


class TestLoginAPI:
    """로그인 API 테스트."""

    @patch("app.presentation.api.dependencies.get_user_repository")
    @patch("app.presentation.api.dependencies.get_jwt_service")
    def test_login_with_valid_credentials(
        self,
        mock_get_jwt,
        mock_get_repo,
        client: TestClient,
        mock_user: User,
    ):
        """유효한 자격증명으로 로그인 시 토큰을 반환해야 한다."""
        # Mock 설정
        mock_repo = AsyncMock()
        mock_repo.find_by_email.return_value = mock_user
        mock_get_repo.return_value = mock_repo

        mock_jwt = AsyncMock()
        mock_jwt.create_access_token.return_value = "test_access_token"
        mock_jwt.create_refresh_token.return_value = "test_refresh_token"
        mock_jwt.access_token_expire_seconds = 1800
        mock_get_jwt.return_value = mock_jwt

        response = client.post(
            "/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "SecureP@ss1",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "tokens" in data
        assert "user" in data
        assert data["tokens"]["access_token"] == "test_access_token"
        assert data["tokens"]["token_type"] == "bearer"

    @patch("app.presentation.api.dependencies.get_user_repository")
    @patch("app.presentation.api.dependencies.get_jwt_service")
    def test_login_with_wrong_password(
        self,
        mock_get_jwt,
        mock_get_repo,
        client: TestClient,
        mock_user: User,
    ):
        """잘못된 비밀번호로 로그인 시 401 에러를 반환해야 한다."""
        mock_repo = AsyncMock()
        mock_repo.find_by_email.return_value = mock_user
        mock_get_repo.return_value = mock_repo

        response = client.post(
            "/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "WrongPassword1!",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["code"] == "INVALID_CREDENTIALS"

    @patch("app.presentation.api.dependencies.get_user_repository")
    @patch("app.presentation.api.dependencies.get_jwt_service")
    def test_login_with_nonexistent_email(
        self,
        mock_get_jwt,
        mock_get_repo,
        client: TestClient,
    ):
        """존재하지 않는 이메일로 로그인 시 401 에러를 반환해야 한다."""
        mock_repo = AsyncMock()
        mock_repo.find_by_email.return_value = None
        mock_get_repo.return_value = mock_repo

        response = client.post(
            "/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SecureP@ss1",
            },
        )

        assert response.status_code == 401


class TestProtectedRoutes:
    """인증이 필요한 라우트 테스트."""

    def test_get_me_without_token(self, client: TestClient):
        """토큰 없이 /users/me 접근 시 401 에러를 반환해야 한다."""
        response = client.get("/v1/users/me")
        assert response.status_code == 403  # HTTPBearer returns 403 when missing

    def test_get_me_with_invalid_token(self, client: TestClient):
        """유효하지 않은 토큰으로 /users/me 접근 시 401 에러를 반환해야 한다."""
        response = client.get(
            "/v1/users/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401
