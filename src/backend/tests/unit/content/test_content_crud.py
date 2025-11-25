"""콘텐츠 CRUD 단위 테스트.

TDD RED 단계: 실패하는 테스트를 먼저 작성합니다.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

from app.domain.entities.content import Content
from app.application.dto.content import (
    ContentResponse,
    ContentListResponse,
    CreateContentRequest,
    UpdateContentRequest,
)
from app.application.use_cases.content import (
    GetContentUseCase,
    ListContentsUseCase,
    CreateContentUseCase,
    UpdateContentUseCase,
    DeleteContentUseCase,
)
from app.domain.exceptions.content import ContentNotFoundError


class TestContentEntity:
    """콘텐츠 엔티티 테스트."""

    def test_should_create_content_with_default_values(self):
        """기본값으로 콘텐츠를 생성할 수 있다."""
        content = Content(title="Test Drama")

        assert content.title == "Test Drama"
        assert content.content_type == "drama"
        assert content.is_published is True
        assert content.view_count == 0
        assert content.rating == 0.0

    def test_should_get_localized_title(self):
        """언어에 맞는 제목을 반환해야 한다."""
        content = Content(
            title="사랑의 불시착",
            title_es="Aterrizaje de Emergencia en Tu Corazon",
            title_pt="Pousando no Amor",
        )

        assert content.get_title("es") == "Aterrizaje de Emergencia en Tu Corazon"
        assert content.get_title("pt") == "Pousando no Amor"
        assert content.get_title("ko") == "사랑의 불시착"

    def test_should_increment_view_count(self):
        """조회수를 증가시킬 수 있다."""
        content = Content(title="Test", view_count=100)

        content.increment_view_count()

        assert content.view_count == 101

    def test_should_update_rating(self):
        """평점을 업데이트할 수 있다."""
        content = Content(title="Test", rating=3.0)

        content.update_rating(4.5)

        assert content.rating == 4.5

    def test_should_not_update_invalid_rating(self):
        """유효하지 않은 평점은 업데이트되지 않아야 한다."""
        content = Content(title="Test", rating=3.0)

        content.update_rating(6.0)  # 유효하지 않은 값

        assert content.rating == 3.0  # 변경되지 않음

    def test_should_check_if_content_is_viewable(self):
        """콘텐츠가 조회 가능한지 확인할 수 있다."""
        published_content = Content(
            title="Test",
            is_published=True,
            video_url="https://example.com/video.m3u8"
        )
        unpublished_content = Content(
            title="Test",
            is_published=False,
            video_url="https://example.com/video.m3u8"
        )
        no_video_content = Content(
            title="Test",
            is_published=True,
            video_url=""
        )

        assert published_content.is_viewable() is True
        assert unpublished_content.is_viewable() is False
        assert no_video_content.is_viewable() is False


class TestGetContent:
    """콘텐츠 조회 테스트."""

    @pytest.fixture
    def mock_content_repository(self):
        """콘텐츠 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_return_content_by_id(self, mock_content_repository):
        """ID로 콘텐츠를 조회할 수 있다."""
        # Given
        content_id = uuid4()
        content = Content(
            id=content_id,
            title="Goblin",
            title_es="Goblin: El Guardian Solitario",
            content_type="drama",
            genre=["fantasy", "romance"],
            release_year=2016,
        )
        mock_content_repository.find_by_id = AsyncMock(return_value=content)

        use_case = GetContentUseCase(mock_content_repository)

        # When
        result = await use_case.execute(content_id)

        # Then
        assert isinstance(result, ContentResponse)
        assert result.id == str(content_id)
        assert result.title == "Goblin"
        mock_content_repository.find_by_id.assert_called_once_with(content_id)

    @pytest.mark.asyncio
    async def test_should_return_404_for_nonexistent_content(
        self, mock_content_repository
    ):
        """존재하지 않는 콘텐츠 조회 시 에러를 발생시켜야 한다."""
        # Given
        content_id = uuid4()
        mock_content_repository.find_by_id = AsyncMock(return_value=None)

        use_case = GetContentUseCase(mock_content_repository)

        # When & Then
        with pytest.raises(ContentNotFoundError):
            await use_case.execute(content_id)


class TestListContents:
    """콘텐츠 목록 조회 테스트."""

    @pytest.fixture
    def mock_content_repository(self):
        """콘텐츠 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_list_contents_with_pagination(
        self, mock_content_repository
    ):
        """콘텐츠 목록을 페이지네이션으로 조회할 수 있다."""
        # Given
        contents = [
            Content(title="Drama 1", content_type="drama"),
            Content(title="Drama 2", content_type="drama"),
        ]
        mock_content_repository.find_all = AsyncMock(return_value=contents)
        mock_content_repository.count = AsyncMock(return_value=10)

        use_case = ListContentsUseCase(mock_content_repository)

        # When
        result = await use_case.execute(page=1, per_page=10)

        # Then
        assert isinstance(result, ContentListResponse)
        assert len(result.items) == 2
        assert result.total == 10
        assert result.page == 1

    @pytest.mark.asyncio
    async def test_should_filter_contents_by_content_type(
        self, mock_content_repository
    ):
        """콘텐츠 유형으로 필터링할 수 있다."""
        # Given
        contents = [Content(title="Drama 1", content_type="drama")]
        mock_content_repository.find_by_type = AsyncMock(return_value=contents)
        mock_content_repository.count_by_type = AsyncMock(return_value=5)

        use_case = ListContentsUseCase(mock_content_repository)

        # When
        result = await use_case.execute(page=1, per_page=10, content_type="drama")

        # Then
        assert len(result.items) == 1
        mock_content_repository.find_by_type.assert_called_once()

    @pytest.mark.asyncio
    async def test_should_filter_contents_by_genre(self, mock_content_repository):
        """장르로 콘텐츠를 필터링할 수 있다."""
        # Given
        contents = [
            Content(title="Romance Drama", genre=["romance", "drama"]),
        ]
        mock_content_repository.find_by_genre = AsyncMock(return_value=contents)
        mock_content_repository.count_by_genre = AsyncMock(return_value=3)

        use_case = ListContentsUseCase(mock_content_repository)

        # When
        result = await use_case.execute(page=1, per_page=10, genre="romance")

        # Then
        assert len(result.items) == 1
        mock_content_repository.find_by_genre.assert_called_once()


class TestCreateContent:
    """콘텐츠 생성 테스트."""

    @pytest.fixture
    def mock_content_repository(self):
        """콘텐츠 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_create_content_with_valid_data(
        self, mock_content_repository
    ):
        """유효한 데이터로 콘텐츠를 생성할 수 있다."""
        # Given
        content_id = uuid4()
        mock_content_repository.create = AsyncMock(
            return_value=Content(
                id=content_id,
                title="New Drama",
                content_type="drama",
                genre=["romance"],
            )
        )

        use_case = CreateContentUseCase(mock_content_repository)
        request = CreateContentRequest(
            title="New Drama",
            content_type="drama",
            genre=["romance"],
        )

        # When
        result = await use_case.execute(request)

        # Then
        assert result.title == "New Drama"
        mock_content_repository.create.assert_called_once()


class TestUpdateContent:
    """콘텐츠 수정 테스트."""

    @pytest.fixture
    def mock_content_repository(self):
        """콘텐츠 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_update_content(self, mock_content_repository):
        """콘텐츠를 수정할 수 있다."""
        # Given
        content_id = uuid4()
        existing_content = Content(id=content_id, title="Old Title")
        updated_content = Content(id=content_id, title="New Title")

        mock_content_repository.find_by_id = AsyncMock(return_value=existing_content)
        mock_content_repository.update = AsyncMock(return_value=updated_content)

        use_case = UpdateContentUseCase(mock_content_repository)
        request = UpdateContentRequest(title="New Title")

        # When
        result = await use_case.execute(content_id, request)

        # Then
        assert result.title == "New Title"


class TestDeleteContent:
    """콘텐츠 삭제 테스트."""

    @pytest.fixture
    def mock_content_repository(self):
        """콘텐츠 리포지토리 목."""
        return MagicMock()

    @pytest.mark.asyncio
    async def test_should_delete_content(self, mock_content_repository):
        """콘텐츠를 삭제할 수 있다."""
        # Given
        content_id = uuid4()
        content = Content(id=content_id, title="To Delete")
        mock_content_repository.find_by_id = AsyncMock(return_value=content)
        mock_content_repository.delete = AsyncMock(return_value=True)

        use_case = DeleteContentUseCase(mock_content_repository)

        # When
        result = await use_case.execute(content_id)

        # Then
        assert result is True
        mock_content_repository.delete.assert_called_once_with(content_id)
