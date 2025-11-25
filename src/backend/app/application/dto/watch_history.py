"""WatchHistory DTOs - 시청 기록 관련 데이터 전송 객체."""

from datetime import datetime

from pydantic import BaseModel, Field


class WatchHistoryResponse(BaseModel):
    """시청 기록 응답 DTO."""

    id: str = Field(..., description="시청 기록 ID")
    content_id: str = Field(..., description="콘텐츠 ID")
    content_title: str = Field(..., description="콘텐츠 제목")
    episode_number: int | None = Field(None, description="에피소드 번호")
    progress_seconds: int = Field(..., description="진행 시간 (초)")
    duration_seconds: int = Field(..., description="전체 재생 시간 (초)")
    progress_percentage: float = Field(..., description="진행률 (%)")
    is_completed: bool = Field(..., description="시청 완료 여부")
    thumbnail_url: str | None = Field(None, description="썸네일 URL")
    watched_at: datetime = Field(..., description="마지막 시청 시간")


class RecordWatchProgressRequest(BaseModel):
    """시청 진행 상황 기록 요청 DTO."""

    content_id: str = Field(..., description="콘텐츠 ID")
    content_title: str = Field(..., max_length=200, description="콘텐츠 제목")
    episode_number: int | None = Field(None, ge=1, description="에피소드 번호")
    progress_seconds: int = Field(..., ge=0, description="진행 시간 (초)")
    duration_seconds: int = Field(..., gt=0, description="전체 재생 시간 (초)")
    thumbnail_url: str | None = Field(None, max_length=500, description="썸네일 URL")


class WatchProgressResponse(BaseModel):
    """시청 진행 상황 응답 DTO."""

    content_id: str = Field(..., description="콘텐츠 ID")
    episode_number: int | None = Field(None, description="에피소드 번호")
    progress_seconds: int = Field(..., description="진행 시간 (초)")
    duration_seconds: int = Field(..., description="전체 재생 시간 (초)")
    progress_percentage: float = Field(..., description="진행률 (%)")
