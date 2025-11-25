"""WatchHistory API - 시청 기록 관련 엔드포인트."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.application.dto.watch_history import (
    WatchHistoryResponse,
    RecordWatchProgressRequest,
    WatchProgressResponse,
)
from app.application.use_cases.watch_history import (
    GetWatchHistoryUseCase,
    RecordWatchProgressUseCase,
    GetWatchProgressUseCase,
)
from app.domain.entities.user import User
from app.presentation.api.dependencies import (
    get_current_user,
    get_watch_history_repository,
)

router = APIRouter()


@router.get(
    "",
    response_model=list[WatchHistoryResponse],
    summary="시청 기록 조회",
    description="사용자의 시청 기록을 최신순으로 조회합니다.",
)
async def get_watch_history(
    current_user: User = Depends(get_current_user),
    watch_history_repository=Depends(get_watch_history_repository),
    limit: int = Query(20, ge=1, le=100, description="조회 개수"),
    offset: int = Query(0, ge=0, description="시작 위치"),
) -> list[WatchHistoryResponse]:
    """시청 기록 조회 엔드포인트.

    Returns:
        list[WatchHistoryResponse]: 시청 기록 목록
    """
    use_case = GetWatchHistoryUseCase(watch_history_repository)
    return await use_case.execute(current_user.id, limit=limit, offset=offset)


@router.post(
    "",
    response_model=WatchHistoryResponse,
    summary="시청 진행 상황 기록",
    description="콘텐츠 시청 진행 상황을 기록합니다.",
)
async def record_watch_progress(
    request: RecordWatchProgressRequest,
    current_user: User = Depends(get_current_user),
    watch_history_repository=Depends(get_watch_history_repository),
) -> WatchHistoryResponse:
    """시청 진행 상황 기록 엔드포인트.

    Args:
        request: 시청 진행 상황

    Returns:
        WatchHistoryResponse: 저장된 시청 기록
    """
    use_case = RecordWatchProgressUseCase(watch_history_repository)
    return await use_case.execute(current_user.id, request)


@router.get(
    "/content/{content_id}",
    response_model=WatchProgressResponse | None,
    summary="콘텐츠 시청 진행 상황 조회",
    description="특정 콘텐츠의 시청 진행 상황을 조회합니다.",
)
async def get_content_progress(
    content_id: UUID,
    current_user: User = Depends(get_current_user),
    watch_history_repository=Depends(get_watch_history_repository),
) -> WatchProgressResponse | None:
    """콘텐츠 시청 진행 상황 조회 엔드포인트.

    Args:
        content_id: 콘텐츠 ID

    Returns:
        WatchProgressResponse | None: 시청 진행 상황 또는 None
    """
    use_case = GetWatchProgressUseCase(watch_history_repository)
    return await use_case.execute(current_user.id, content_id)
