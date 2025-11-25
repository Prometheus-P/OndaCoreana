"""Favorite DTOs - 즐겨찾기 관련 데이터 전송 객체."""

from datetime import datetime

from pydantic import BaseModel, Field


class FavoriteResponse(BaseModel):
    """즐겨찾기 응답 DTO."""

    id: str = Field(..., description="즐겨찾기 ID")
    content_id: str = Field(..., description="콘텐츠 ID")
    content_title: str = Field(..., description="콘텐츠 제목")
    content_type: str = Field(..., description="콘텐츠 유형")
    thumbnail_url: str | None = Field(None, description="썸네일 URL")
    created_at: datetime = Field(..., description="추가 일시")


class AddFavoriteRequest(BaseModel):
    """즐겨찾기 추가 요청 DTO."""

    content_id: str = Field(..., description="콘텐츠 ID")
    content_title: str = Field(..., max_length=200, description="콘텐츠 제목")
    content_type: str = Field(..., max_length=50, description="콘텐츠 유형")
    thumbnail_url: str | None = Field(None, max_length=500, description="썸네일 URL")


class FavoriteCheckResponse(BaseModel):
    """즐겨찾기 확인 응답 DTO."""

    content_id: str = Field(..., description="콘텐츠 ID")
    is_favorite: bool = Field(..., description="즐겨찾기 여부")
