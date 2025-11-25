"""Email Value Object - 이메일 값 객체."""

import re
from dataclasses import dataclass

from app.domain.exceptions.validation import InvalidEmailError


@dataclass(frozen=True)
class Email:
    """이메일 값 객체.

    이메일 형식 검증을 포함하는 불변 값 객체입니다.

    Attributes:
        value: 이메일 주소 문자열
    """

    value: str

    # RFC 5322 간소화 버전 이메일 패턴
    EMAIL_PATTERN = re.compile(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    )

    def __post_init__(self) -> None:
        """생성 후 유효성 검증."""
        if not self.value:
            raise InvalidEmailError("이메일은 필수입니다.")

        # 소문자로 정규화
        object.__setattr__(self, "value", self.value.lower().strip())

        if not self.is_valid():
            raise InvalidEmailError(f"잘못된 이메일 형식입니다: {self.value}")

        if len(self.value) > 255:
            raise InvalidEmailError("이메일은 255자 이내여야 합니다.")

    def is_valid(self) -> bool:
        """이메일 형식이 유효한지 확인합니다."""
        return bool(self.EMAIL_PATTERN.match(self.value))

    @property
    def domain(self) -> str:
        """이메일 도메인을 반환합니다."""
        return self.value.split("@")[1]

    @property
    def local_part(self) -> str:
        """이메일 로컬 파트를 반환합니다."""
        return self.value.split("@")[0]

    def __str__(self) -> str:
        """문자열 표현."""
        return self.value

    def __repr__(self) -> str:
        """디버그용 문자열 표현."""
        return f"Email('{self.value}')"
