"""Content Use Cases - 콘텐츠 유스케이스."""

from typing import Literal
from uuid import UUID

from app.application.dto.content import (
    ContentResponse,
    ContentSummaryResponse,
    ContentListResponse,
    CreateContentRequest,
    UpdateContentRequest,
)
from app.domain.entities.content import Content
from app.domain.exceptions.content import ContentNotFoundError
from app.domain.repositories.content_repository import ContentRepository

# 콘텐츠 유형 타입 정의
ContentType = Literal["drama", "movie", "mv", "variety"]


class GetContentUseCase:
    """콘텐츠 조회 유스케이스."""

    def __init__(self, content_repository: ContentRepository) -> None:
        self._content_repository = content_repository

    async def execute(
        self,
        content_id: UUID,
        include_video_url: bool = False,
    ) -> ContentResponse:
        """콘텐츠를 조회합니다.

        Args:
            content_id: 콘텐츠 ID
            include_video_url: 비디오 URL 포함 여부 (인증된 사용자용)

        Returns:
            ContentResponse: 콘텐츠 정보

        Raises:
            ContentNotFoundError: 콘텐츠가 존재하지 않을 때
        """
        content = await self._content_repository.find_by_id(content_id)

        if not content:
            raise ContentNotFoundError(str(content_id))

        return self._to_response(content, include_video_url)

    def _to_response(
        self,
        content: Content,
        include_video_url: bool = False,
    ) -> ContentResponse:
        return ContentResponse(
            id=str(content.id),
            title=content.title,
            title_es=content.title_es,
            title_pt=content.title_pt,
            description=content.description,
            description_es=content.description_es,
            description_pt=content.description_pt,
            content_type=content.content_type,
            genre=content.genre,
            release_year=content.release_year,
            duration_minutes=content.duration_minutes,
            thumbnail_url=content.thumbnail_url,
            video_url=content.video_url if include_video_url else None,
            rating=content.rating,
            view_count=content.view_count,
            is_published=content.is_published,
            cast=content.cast,
            director=content.director,
            production_company=content.production_company,
            season=content.season,
            episode=content.episode,
            series_id=str(content.series_id) if content.series_id else None,
            created_at=content.created_at.isoformat(),
            updated_at=content.updated_at.isoformat(),
        )


class ListContentsUseCase:
    """콘텐츠 목록 조회 유스케이스."""

    def __init__(self, content_repository: ContentRepository) -> None:
        self._content_repository = content_repository

    async def execute(
        self,
        page: int = 1,
        per_page: int = 20,
        content_type: ContentType | None = None,
        genre: str | None = None,
        search: str | None = None,
    ) -> ContentListResponse:
        """콘텐츠 목록을 조회합니다.

        Args:
            page: 페이지 번호 (1부터 시작)
            per_page: 페이지당 항목 수
            content_type: 필터링할 콘텐츠 유형
            genre: 필터링할 장르
            search: 검색어

        Returns:
            ContentListResponse: 콘텐츠 목록 응답
        """
        offset = (page - 1) * per_page

        if search:
            contents = await self._content_repository.search(search, offset, per_page)
            total = await self._content_repository.count_search(search)
        elif content_type:
            contents = await self._content_repository.find_by_type(
                content_type, offset, per_page
            )
            total = await self._content_repository.count_by_type(content_type)
        elif genre:
            contents = await self._content_repository.find_by_genre(
                genre, offset, per_page
            )
            total = await self._content_repository.count_by_genre(genre)
        else:
            contents = await self._content_repository.find_all(offset, per_page)
            total = await self._content_repository.count()

        total_pages = (total + per_page - 1) // per_page

        return ContentListResponse(
            items=[self._to_summary(c) for c in contents],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    def _to_summary(self, content: Content) -> ContentSummaryResponse:
        return ContentSummaryResponse(
            id=str(content.id),
            title=content.title,
            title_es=content.title_es,
            content_type=content.content_type,
            genre=content.genre,
            release_year=content.release_year,
            duration_minutes=content.duration_minutes,
            thumbnail_url=content.thumbnail_url,
            rating=content.rating,
            view_count=content.view_count,
        )


class CreateContentUseCase:
    """콘텐츠 생성 유스케이스."""

    def __init__(self, content_repository: ContentRepository) -> None:
        self._content_repository = content_repository

    async def execute(self, request: CreateContentRequest) -> ContentResponse:
        """새 콘텐츠를 생성합니다.

        Args:
            request: 콘텐츠 생성 요청

        Returns:
            ContentResponse: 생성된 콘텐츠
        """
        content = Content(
            title=request.title,
            title_es=request.title_es or request.title,
            title_pt=request.title_pt or request.title,
            description=request.description,
            description_es=request.description_es or request.description,
            description_pt=request.description_pt or request.description,
            content_type=request.content_type,
            genre=request.genre,
            release_year=request.release_year,
            duration_minutes=request.duration_minutes,
            thumbnail_url=request.thumbnail_url,
            video_url=request.video_url,
            cast=request.cast,
            director=request.director,
            production_company=request.production_company,
            season=request.season,
            episode=request.episode,
            series_id=UUID(request.series_id) if request.series_id else None,  # handles empty string
            is_published=request.is_published,
        )

        created = await self._content_repository.create(content)

        return ContentResponse(
            id=str(created.id),
            title=created.title,
            title_es=created.title_es,
            title_pt=created.title_pt,
            description=created.description,
            description_es=created.description_es,
            description_pt=created.description_pt,
            content_type=created.content_type,
            genre=created.genre,
            release_year=created.release_year,
            duration_minutes=created.duration_minutes,
            thumbnail_url=created.thumbnail_url,
            video_url=created.video_url,
            rating=created.rating,
            view_count=created.view_count,
            is_published=created.is_published,
            cast=created.cast,
            director=created.director,
            production_company=created.production_company,
            season=created.season,
            episode=created.episode,
            series_id=str(created.series_id) if created.series_id else None,
            created_at=created.created_at.isoformat(),
            updated_at=created.updated_at.isoformat(),
        )


class UpdateContentUseCase:
    """콘텐츠 수정 유스케이스."""

    def __init__(self, content_repository: ContentRepository) -> None:
        self._content_repository = content_repository

    async def execute(
        self,
        content_id: UUID,
        request: UpdateContentRequest,
    ) -> ContentResponse:
        """콘텐츠를 수정합니다.

        Args:
            content_id: 콘텐츠 ID
            request: 수정 요청

        Returns:
            ContentResponse: 수정된 콘텐츠

        Raises:
            ContentNotFoundError: 콘텐츠가 존재하지 않을 때
        """
        content = await self._content_repository.find_by_id(content_id)

        if not content:
            raise ContentNotFoundError(str(content_id))

        # 업데이트할 필드만 적용
        if request.title is not None:
            content.title = request.title
        if request.title_es is not None:
            content.title_es = request.title_es
        if request.title_pt is not None:
            content.title_pt = request.title_pt
        if request.description is not None:
            content.description = request.description
        if request.description_es is not None:
            content.description_es = request.description_es
        if request.description_pt is not None:
            content.description_pt = request.description_pt
        if request.content_type is not None:
            content.content_type = request.content_type
        if request.genre is not None:
            content.genre = request.genre
        if request.release_year is not None:
            content.release_year = request.release_year
        if request.duration_minutes is not None:
            content.duration_minutes = request.duration_minutes
        if request.thumbnail_url is not None:
            content.thumbnail_url = request.thumbnail_url
        if request.video_url is not None:
            content.video_url = request.video_url
        if request.cast is not None:
            content.cast = request.cast
        if request.director is not None:
            content.director = request.director
        if request.production_company is not None:
            content.production_company = request.production_company
        if request.season is not None:
            content.season = request.season
        if request.episode is not None:
            content.episode = request.episode
        if request.series_id is not None:
            content.series_id = UUID(request.series_id) if request.series_id else None
        if request.is_published is not None:
            content.is_published = request.is_published

        updated = await self._content_repository.update(content)

        return ContentResponse(
            id=str(updated.id),
            title=updated.title,
            title_es=updated.title_es,
            title_pt=updated.title_pt,
            description=updated.description,
            description_es=updated.description_es,
            description_pt=updated.description_pt,
            content_type=updated.content_type,
            genre=updated.genre,
            release_year=updated.release_year,
            duration_minutes=updated.duration_minutes,
            thumbnail_url=updated.thumbnail_url,
            video_url=updated.video_url,
            rating=updated.rating,
            view_count=updated.view_count,
            is_published=updated.is_published,
            cast=updated.cast,
            director=updated.director,
            production_company=updated.production_company,
            season=updated.season,
            episode=updated.episode,
            series_id=str(updated.series_id) if updated.series_id else None,
            created_at=updated.created_at.isoformat(),
            updated_at=updated.updated_at.isoformat(),
        )


class DeleteContentUseCase:
    """콘텐츠 삭제 유스케이스."""

    def __init__(self, content_repository: ContentRepository) -> None:
        self._content_repository = content_repository

    async def execute(self, content_id: UUID) -> bool:
        """콘텐츠를 삭제합니다.

        Args:
            content_id: 삭제할 콘텐츠 ID

        Returns:
            bool: 삭제 성공 여부

        Raises:
            ContentNotFoundError: 콘텐츠가 존재하지 않을 때
        """
        content = await self._content_repository.find_by_id(content_id)

        if not content:
            raise ContentNotFoundError(str(content_id))

        return await self._content_repository.delete(content_id)
