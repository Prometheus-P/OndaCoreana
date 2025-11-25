"""Error Handler Middleware - 전역 에러 핸들러."""

import logging
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.domain.exceptions.base import DomainError

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """전역 에러 핸들러 미들웨어.

    도메인 예외를 적절한 HTTP 응답으로 변환합니다.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        """요청을 처리하고 예외를 핸들링합니다."""
        try:
            return await call_next(request)
        except DomainError as e:
            logger.warning(f"Domain error: {e.code} - {e.message}")
            return JSONResponse(
                status_code=400,
                content={"code": e.code, "message": e.message},
            )
        except Exception as e:
            logger.exception(f"Unexpected error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "code": "INTERNAL_ERROR",
                    "message": "서버 내부 오류가 발생했습니다.",
                },
            )


def error_handler_middleware(app):
    """에러 핸들러 미들웨어를 추가합니다."""
    app.add_middleware(ErrorHandlerMiddleware)
