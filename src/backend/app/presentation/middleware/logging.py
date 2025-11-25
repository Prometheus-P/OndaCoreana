"""Logging Middleware - 로깅 미들웨어."""

import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """요청/응답 로깅 미들웨어."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        """요청을 처리하고 로깅합니다."""
        start_time = time.time()

        # 요청 로깅
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )

        response = await call_next(request)

        # 응답 로깅
        process_time = time.time() - start_time
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code} "
            f"time={process_time:.3f}s"
        )

        # 응답 헤더에 처리 시간 추가
        response.headers["X-Process-Time"] = str(process_time)

        return response


def logging_middleware(app):
    """로깅 미들웨어를 추가합니다."""
    app.add_middleware(LoggingMiddleware)
