"""Content Entity - 콘텐츠 도메인 엔티티."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal
from uuid import UUID

from app.domain.entities.base import Entity


@dataclass
class Content(Entity):
    """콘텐츠 엔티티.

    K-드라마, K-팝 MV 등의 콘텐츠 정보를 포함합니다.

    Attributes:
        title: 콘텐츠 제목
        title_es: 스페인어 제목
        title_pt: 포르투갈어 제목
        description: 콘텐츠 설명
        content_type: 콘텐츠 유형 (drama, movie, mv, variety)
        genre: 장르 목록
        release_year: 출시 연도
        duration_minutes: 재생 시간 (분)
        thumbnail_url: 썸네일 URL
        video_url: 비디오 URL (스트리밍)
        rating: 평균 평점 (1-5)
        view_count: 조회수
        is_published: 게시 여부
    """

    title: str = ""
    title_es: str = ""
    title_pt: str = ""
    description: str = ""
    description_es: str = ""
    description_pt: str = ""
    content_type: Literal["drama", "movie", "mv", "variety"] = "drama"
    genre: list[str] = field(default_factory=list)
    release_year: int = 2024
    duration_minutes: int = 0
    thumbnail_url: str = ""
    video_url: str = ""
    rating: float = 0.0
    view_count: int = 0
    is_published: bool = True

    # 관련 정보
    cast: list[str] = field(default_factory=list)
    director: str = ""
    production_company: str = ""

    # 시리즈 정보 (드라마용)
    season: int | None = None
    episode: int | None = None
    series_id: UUID | None = None

    def __init__(
        self,
        title: str = "",
        title_es: str = "",
        title_pt: str = "",
        description: str = "",
        description_es: str = "",
        description_pt: str = "",
        content_type: Literal["drama", "movie", "mv", "variety"] = "drama",
        genre: list[str] | None = None,
        release_year: int = 2024,
        duration_minutes: int = 0,
        thumbnail_url: str = "",
        video_url: str = "",
        rating: float = 0.0,
        view_count: int = 0,
        is_published: bool = True,
        cast: list[str] | None = None,
        director: str = "",
        production_company: str = "",
        season: int | None = None,
        episode: int | None = None,
        series_id: UUID | None = None,
        id: UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.title = title
        self.title_es = title_es or title
        self.title_pt = title_pt or title
        self.description = description
        self.description_es = description_es or description
        self.description_pt = description_pt or description
        self.content_type = content_type
        self.genre = genre or []
        self.release_year = release_year
        self.duration_minutes = duration_minutes
        self.thumbnail_url = thumbnail_url
        self.video_url = video_url
        self.rating = rating
        self.view_count = view_count
        self.is_published = is_published
        self.cast = cast or []
        self.director = director
        self.production_company = production_company
        self.season = season
        self.episode = episode
        self.series_id = series_id

    def get_title(self, language: str = "es") -> str:
        """언어에 맞는 제목을 반환합니다.

        Args:
            language: 언어 코드 (es, pt, ko)

        Returns:
            str: 해당 언어의 제목
        """
        if language == "pt":
            return self.title_pt or self.title
        elif language == "es":
            return self.title_es or self.title
        return self.title

    def get_description(self, language: str = "es") -> str:
        """언어에 맞는 설명을 반환합니다.

        Args:
            language: 언어 코드 (es, pt, ko)

        Returns:
            str: 해당 언어의 설명
        """
        if language == "pt":
            return self.description_pt or self.description
        elif language == "es":
            return self.description_es or self.description
        return self.description

    def increment_view_count(self) -> None:
        """조회수를 증가시킵니다."""
        self.view_count += 1
        self.updated_at = datetime.utcnow()

    def update_rating(self, new_rating: float) -> None:
        """평점을 업데이트합니다.

        Args:
            new_rating: 새로운 평점 (1-5)
        """
        if 1 <= new_rating <= 5:
            self.rating = new_rating
            self.updated_at = datetime.utcnow()

    def publish(self) -> None:
        """콘텐츠를 게시합니다."""
        self.is_published = True
        self.updated_at = datetime.utcnow()

    def unpublish(self) -> None:
        """콘텐츠를 비게시 처리합니다."""
        self.is_published = False
        self.updated_at = datetime.utcnow()

    def is_series(self) -> bool:
        """시리즈 에피소드인지 확인합니다."""
        return self.series_id is not None

    def is_viewable(self) -> bool:
        """조회 가능한 콘텐츠인지 확인합니다."""
        return self.is_published and bool(self.video_url)
