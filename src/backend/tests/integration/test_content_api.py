"""콘텐츠 API 통합 테스트.

FastAPI TestClient를 사용한 Content API 엔드포인트 통합 테스트.
"""

import pytest
from unittest.mock import AsyncMock
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.domain.entities.content import Content
from app.domain.entities.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.password import Password
from app.presentation.api.dependencies import (
    get_content_repository,
    get_user_repository,
    get_jwt_service,
)
from app.infrastructure.external.jwt_service import JWTServiceImpl
from app.config.settings import Settings


@pytest.fixture
def test_settings():
    """테스트용 설정."""
    return Settings(
        app_env="development",
        database_url="postgresql://test:test@localhost:5432/test",
        redis_url="redis://localhost:6379/1",
        secret_key="test-secret-key-for-testing-only",
        supabase_url="https://test.supabase.co",
        supabase_service_key="test-service-key",
    )


@pytest.fixture
def jwt_service(test_settings):
    """JWT 서비스 인스턴스."""
    return JWTServiceImpl(test_settings)


@pytest.fixture
def mock_content_repository():
    """Mock 콘텐츠 리포지토리."""
    return AsyncMock()


@pytest.fixture
def mock_user_repository():
    """Mock 사용자 리포지토리."""
    return AsyncMock()


@pytest.fixture
def client(mock_content_repository, mock_user_repository, jwt_service):
    """테스트 클라이언트를 반환합니다."""
    app.dependency_overrides[get_content_repository] = lambda: mock_content_repository
    app.dependency_overrides[get_user_repository] = lambda: mock_user_repository
    app.dependency_overrides[get_jwt_service] = lambda: jwt_service
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def mock_admin_user():
    """테스트용 관리자 사용자를 생성합니다."""
    password = Password("AdminP@ss123")
    return User(
        id=uuid4(),
        email=Email("admin@example.com"),
        password_hash=password.hash(),
        nickname="Admin",
        country="KR",
        preferred_language="ko",
        is_active=True,
        is_verified=True,
        role="admin",
    )


@pytest.fixture
def mock_content():
    """테스트용 콘텐츠를 생성합니다."""
    return Content(
        id=uuid4(),
        title="사랑의 불시착",
        title_es="Aterrizaje de Emergencia en Tu Corazón",
        title_pt="Pousando no Amor",
        description="남한 재벌 상속녀와 북한 장교의 로맨스",
        description_es="Romance entre una heredera surcoreana y un oficial norcoreano",
        description_pt="Romance entre uma herdeira sul-coreana e um oficial norte-coreano",
        content_type="drama",
        genre=["romance", "drama"],
        release_year=2019,
        duration_minutes=70,
        thumbnail_url="https://example.com/thumbnail.jpg",
        video_url="https://example.com/video.mp4",
        rating=4.8,
        view_count=1000000,
        is_published=True,
        cast=["현빈", "손예진"],
        director="이정효",
        production_company="스튜디오드래곤",
    )


class TestListContents:
    """콘텐츠 목록 조회 API 테스트."""

    def test_should_return_content_list(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """콘텐츠 목록을 반환해야 한다."""
        # Given
        mock_content_repository.find_all.return_value = [mock_content]
        mock_content_repository.count.return_value = 1

        # When
        response = client.get("/v1/contents")

        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "사랑의 불시착"

    def test_should_filter_by_content_type(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """콘텐츠 유형으로 필터링해야 한다."""
        # Given
        mock_content_repository.find_by_type.return_value = [mock_content]
        mock_content_repository.count_by_type.return_value = 1

        # When
        response = client.get("/v1/contents?content_type=drama")

        # Then
        assert response.status_code == 200
        mock_content_repository.find_by_type.assert_called_once()

    def test_should_filter_by_genre(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """장르로 필터링해야 한다."""
        # Given
        mock_content_repository.find_by_genre.return_value = [mock_content]
        mock_content_repository.count_by_genre.return_value = 1

        # When
        response = client.get("/v1/contents?genre=romance")

        # Then
        assert response.status_code == 200
        mock_content_repository.find_by_genre.assert_called_once()

    def test_should_search_contents(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """콘텐츠를 검색해야 한다."""
        # Given
        mock_content_repository.search.return_value = [mock_content]
        mock_content_repository.count_search.return_value = 1

        # When
        response = client.get("/v1/contents?search=불시착")

        # Then
        assert response.status_code == 200
        mock_content_repository.search.assert_called_once()

    def test_should_paginate_results(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """페이지네이션을 적용해야 한다."""
        # Given
        mock_content_repository.find_all.return_value = [mock_content]
        mock_content_repository.count.return_value = 100

        # When
        response = client.get("/v1/contents?page=2&per_page=10")

        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert data["per_page"] == 10
        assert data["total_pages"] == 10


class TestGetContent:
    """콘텐츠 상세 조회 API 테스트."""

    def test_should_return_content_by_id(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """ID로 콘텐츠를 조회해야 한다."""
        # Given
        mock_content_repository.find_by_id.return_value = mock_content

        # When
        response = client.get(f"/v1/contents/{mock_content.id}")

        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "사랑의 불시착"
        assert data["content_type"] == "drama"

    def test_should_hide_video_url_for_unauthenticated_user(
        self, client: TestClient, mock_content_repository, mock_content
    ):
        """미인증 사용자에게는 video_url이 숨겨져야 한다."""
        # Given
        mock_content_repository.find_by_id.return_value = mock_content

        # When
        response = client.get(f"/v1/contents/{mock_content.id}")

        # Then
        assert response.status_code == 200
        data = response.json()
        # video_url은 None 또는 숨김 처리되어야 함
        assert data["video_url"] is None

    def test_should_return_404_for_nonexistent_content(
        self, client: TestClient, mock_content_repository
    ):
        """존재하지 않는 콘텐츠 조회 시 404를 반환해야 한다."""
        # Given
        mock_content_repository.find_by_id.return_value = None

        # When
        response = client.get(f"/v1/contents/{uuid4()}")

        # Then
        assert response.status_code == 404
        data = response.json()
        assert data["detail"]["code"] == "CONTENT_NOT_FOUND"


class TestCreateContent:
    """콘텐츠 생성 API 테스트."""

    def test_should_create_content_as_admin(
        self,
        client: TestClient,
        mock_content_repository,
        mock_user_repository,
        mock_admin_user,
        mock_content,
        jwt_service,
    ):
        """관리자가 콘텐츠를 생성해야 한다."""
        # Given
        mock_user_repository.find_by_id.return_value = mock_admin_user
        mock_content_repository.create.return_value = mock_content
        token = jwt_service.create_access_token(
            user_id=str(mock_admin_user.id),
            email=mock_admin_user.email.value,
            role=mock_admin_user.role,
        )

        # When
        response = client.post(
            "/v1/contents",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "사랑의 불시착",
                "content_type": "drama",
                "genre": ["romance", "drama"],
            },
        )

        # Then
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "사랑의 불시착"

    def test_should_reject_create_without_admin_role(
        self,
        client: TestClient,
        mock_user_repository,
        jwt_service,
    ):
        """일반 사용자의 콘텐츠 생성을 거부해야 한다."""
        # Given
        regular_user = User(
            id=uuid4(),
            email=Email("user@example.com"),
            password_hash=Password("UserP@ss123").hash(),
            nickname="User",
            is_active=True,
            role="user",
        )
        mock_user_repository.find_by_id.return_value = regular_user
        token = jwt_service.create_access_token(
            user_id=str(regular_user.id),
            email=regular_user.email.value,
            role=regular_user.role,
        )

        # When
        response = client.post(
            "/v1/contents",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "테스트",
                "content_type": "drama",
            },
        )

        # Then
        assert response.status_code == 403

    def test_should_reject_create_without_authentication(
        self, client: TestClient
    ):
        """미인증 요청의 콘텐츠 생성을 거부해야 한다."""
        # When
        response = client.post(
            "/v1/contents",
            json={
                "title": "테스트",
                "content_type": "drama",
            },
        )

        # Then
        assert response.status_code == 403  # No auth header


class TestUpdateContent:
    """콘텐츠 수정 API 테스트."""

    def test_should_update_content_as_admin(
        self,
        client: TestClient,
        mock_content_repository,
        mock_user_repository,
        mock_admin_user,
        mock_content,
        jwt_service,
    ):
        """관리자가 콘텐츠를 수정해야 한다."""
        # Given
        mock_user_repository.find_by_id.return_value = mock_admin_user
        mock_content_repository.find_by_id.return_value = mock_content
        updated_content = Content(
            id=mock_content.id,
            title="수정된 제목",
            title_es=mock_content.title_es,
            title_pt=mock_content.title_pt,
            content_type="drama",
        )
        mock_content_repository.update.return_value = updated_content
        token = jwt_service.create_access_token(
            user_id=str(mock_admin_user.id),
            email=mock_admin_user.email.value,
            role=mock_admin_user.role,
        )

        # When
        response = client.patch(
            f"/v1/contents/{mock_content.id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"title": "수정된 제목"},
        )

        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "수정된 제목"


class TestDeleteContent:
    """콘텐츠 삭제 API 테스트."""

    def test_should_delete_content_as_admin(
        self,
        client: TestClient,
        mock_content_repository,
        mock_user_repository,
        mock_admin_user,
        mock_content,
        jwt_service,
    ):
        """관리자가 콘텐츠를 삭제해야 한다."""
        # Given
        mock_user_repository.find_by_id.return_value = mock_admin_user
        mock_content_repository.find_by_id.return_value = mock_content
        mock_content_repository.delete.return_value = True
        token = jwt_service.create_access_token(
            user_id=str(mock_admin_user.id),
            email=mock_admin_user.email.value,
            role=mock_admin_user.role,
        )

        # When
        response = client.delete(
            f"/v1/contents/{mock_content.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Then
        assert response.status_code == 204

    def test_should_return_404_when_deleting_nonexistent_content(
        self,
        client: TestClient,
        mock_content_repository,
        mock_user_repository,
        mock_admin_user,
        jwt_service,
    ):
        """존재하지 않는 콘텐츠 삭제 시 404를 반환해야 한다."""
        # Given
        mock_user_repository.find_by_id.return_value = mock_admin_user
        mock_content_repository.find_by_id.return_value = None
        token = jwt_service.create_access_token(
            user_id=str(mock_admin_user.id),
            email=mock_admin_user.email.value,
            role=mock_admin_user.role,
        )

        # When
        response = client.delete(
            f"/v1/contents/{uuid4()}",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Then
        assert response.status_code == 404
