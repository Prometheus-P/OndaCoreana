"""Contents API - 콘텐츠 관련 엔드포인트."""

from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.dto.content import (
    ContentFilterRequest,
    ContentListResponse,
    ContentResponse,
    ContentSummaryResponse,
    CreateContentRequest,
    UpdateContentRequest,
)
from app.application.use_cases.content import (
    CreateContentUseCase,
    DeleteContentUseCase,
    GetContentUseCase,
    ListContentsUseCase,
    UpdateContentUseCase,
)
from app.domain.entities.user import User
from app.domain.exceptions.content import (
    ContentNotFoundError,
    ContentNotViewableError,
    InvalidContentDataError,
)
from app.presentation.api.dependencies import (
    get_content_repository,
    get_current_admin_user,
    get_current_user_optional,
)

router = APIRouter()


@router.get(
    "",
    response_model=ContentListResponse,
    summary="콘텐츠 목록 조회",
    description="콘텐츠 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.",
)
async def list_contents(
    content_type: Literal["drama", "movie", "mv", "variety"] | None = Query(
        default=None, description="콘텐츠 유형으로 필터"
    ),
    genre: str | None = Query(default=None, description="장르로 필터"),
    search: str | None = Query(default=None, description="검색어"),
    page: int = Query(default=1, ge=1, description="페이지 번호"),
    per_page: int = Query(default=20, ge=1, le=100, description="페이지당 항목 수"),
    content_repository=Depends(get_content_repository),
) -> ContentListResponse:
    """콘텐츠 목록 조회 엔드포인트.

    Returns:
        ContentListResponse: 콘텐츠 목록
    """
    use_case = ListContentsUseCase(content_repository)
    return await use_case.execute(
        page=page,
        per_page=per_page,
        content_type=content_type,
        genre=genre,
        search=search,
    )


@router.get(
    "/{content_id}",
    response_model=ContentResponse,
    summary="콘텐츠 상세 조회",
    description="콘텐츠 상세 정보를 조회합니다. 인증된 사용자에게만 video_url이 제공됩니다.",
)
async def get_content(
    content_id: UUID,
    content_repository=Depends(get_content_repository),
    current_user: User | None = Depends(get_current_user_optional),
) -> ContentResponse:
    """콘텐츠 상세 조회 엔드포인트.

    Args:
        content_id: 콘텐츠 ID

    Returns:
        ContentResponse: 콘텐츠 상세 정보
    """
    try:
        use_case = GetContentUseCase(content_repository)
        # 인증된 사용자에게만 video_url 포함
        return await use_case.execute(content_id, include_video_url=current_user is not None)

    except ContentNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": e.code, "message": e.message},
        )
    except ContentNotViewableError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": e.code, "message": e.message},
        )


@router.post(
    "",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="콘텐츠 생성",
    description="새 콘텐츠를 생성합니다. 관리자 권한이 필요합니다.",
)
async def create_content(
    request: CreateContentRequest,
    current_user: User = Depends(get_current_admin_user),
    content_repository=Depends(get_content_repository),
) -> ContentResponse:
    """콘텐츠 생성 엔드포인트.

    Args:
        request: 생성할 콘텐츠 정보

    Returns:
        ContentResponse: 생성된 콘텐츠
    """
    try:
        use_case = CreateContentUseCase(content_repository)
        return await use_case.execute(request)

    except InvalidContentDataError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": e.code, "message": e.message},
        )


@router.patch(
    "/{content_id}",
    response_model=ContentResponse,
    summary="콘텐츠 수정",
    description="콘텐츠를 수정합니다. 관리자 권한이 필요합니다.",
)
async def update_content(
    content_id: UUID,
    request: UpdateContentRequest,
    current_user: User = Depends(get_current_admin_user),
    content_repository=Depends(get_content_repository),
) -> ContentResponse:
    """콘텐츠 수정 엔드포인트.

    Args:
        content_id: 콘텐츠 ID
        request: 수정할 정보

    Returns:
        ContentResponse: 수정된 콘텐츠
    """
    try:
        use_case = UpdateContentUseCase(content_repository)
        return await use_case.execute(content_id, request)

    except ContentNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": e.code, "message": e.message},
        )
    except InvalidContentDataError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": e.code, "message": e.message},
        )


@router.delete(
    "/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="콘텐츠 삭제",
    description="콘텐츠를 삭제합니다. 관리자 권한이 필요합니다.",
)
async def delete_content(
    content_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    content_repository=Depends(get_content_repository),
) -> None:
    """콘텐츠 삭제 엔드포인트.

    Args:
        content_id: 삭제할 콘텐츠 ID
    """
    try:
        use_case = DeleteContentUseCase(content_repository)
        await use_case.execute(content_id)

    except ContentNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": e.code, "message": e.message},
        )
