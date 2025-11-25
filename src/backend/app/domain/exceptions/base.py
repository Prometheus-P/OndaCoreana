"""Base Domain Exceptions - 기본 도메인 예외."""


class DomainError(Exception):
    """모든 도메인 예외의 기본 클래스.

    Attributes:
        message: 에러 메시지
        code: 에러 코드 (선택)
    """

    def __init__(self, message: str, code: str | None = None) -> None:
        self.message = message
        self.code = code or self.__class__.__name__
        super().__init__(self.message)

    def __str__(self) -> str:
        """문자열 표현."""
        return f"[{self.code}] {self.message}"

    def to_dict(self) -> dict:
        """딕셔너리 변환."""
        return {
            "code": self.code,
            "message": self.message,
        }
