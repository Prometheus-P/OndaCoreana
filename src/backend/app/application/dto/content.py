"""Content DTOs - 콘텐츠 데이터 전송 객체."""

from typing import Literal
from pydantic import BaseModel, Field


class ContentResponse(BaseModel):
    """콘텐츠 응답 DTO."""

    id: str
    title: str
    title_es: str
    title_pt: str
    description: str
    description_es: str
    description_pt: str
    content_type: Literal["drama", "movie", "mv", "variety"]
    genre: list[str]
    release_year: int
    duration_minutes: int
    thumbnail_url: str
    video_url: str | None = None  # 인증된 사용자에게만 제공
    rating: float
    view_count: int
    is_published: bool
    cast: list[str]
    director: str
    production_company: str
    season: int | None = None
    episode: int | None = None
    series_id: str | None = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ContentSummaryResponse(BaseModel):
    """콘텐츠 요약 응답 DTO (목록용)."""

    id: str
    title: str
    title_es: str
    content_type: Literal["drama", "movie", "mv", "variety"]
    genre: list[str]
    release_year: int
    duration_minutes: int
    thumbnail_url: str
    rating: float
    view_count: int

    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    """콘텐츠 목록 응답 DTO."""

    items: list[ContentSummaryResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class CreateContentRequest(BaseModel):
    """콘텐츠 생성 요청 DTO."""

    title: str = Field(..., min_length=1, max_length=200)
    title_es: str = Field(default="", max_length=200)
    title_pt: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=2000)
    description_es: str = Field(default="", max_length=2000)
    description_pt: str = Field(default="", max_length=2000)
    content_type: Literal["drama", "movie", "mv", "variety"]
    genre: list[str] = Field(default_factory=list)
    release_year: int = Field(default=2024, ge=1900, le=2100)
    duration_minutes: int = Field(default=0, ge=0)
    thumbnail_url: str = Field(default="", max_length=500)
    video_url: str = Field(default="", max_length=500)
    cast: list[str] = Field(default_factory=list)
    director: str = Field(default="", max_length=100)
    production_company: str = Field(default="", max_length=100)
    season: int | None = Field(default=None, ge=1)
    episode: int | None = Field(default=None, ge=1)
    series_id: str | None = None
    is_published: bool = True


class UpdateContentRequest(BaseModel):
    """콘텐츠 수정 요청 DTO."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    title_es: str | None = Field(default=None, max_length=200)
    title_pt: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    description_es: str | None = Field(default=None, max_length=2000)
    description_pt: str | None = Field(default=None, max_length=2000)
    content_type: Literal["drama", "movie", "mv", "variety"] | None = None
    genre: list[str] | None = None
    release_year: int | None = Field(default=None, ge=1900, le=2100)
    duration_minutes: int | None = Field(default=None, ge=0)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    video_url: str | None = Field(default=None, max_length=500)
    cast: list[str] | None = None
    director: str | None = Field(default=None, max_length=100)
    production_company: str | None = Field(default=None, max_length=100)
    season: int | None = Field(default=None, ge=1)
    episode: int | None = Field(default=None, ge=1)
    series_id: str | None = None
    is_published: bool | None = None


class ContentFilterRequest(BaseModel):
    """콘텐츠 필터 요청 DTO."""

    content_type: Literal["drama", "movie", "mv", "variety"] | None = None
    genre: str | None = None
    release_year: int | None = None
    search: str | None = None
