"""Password Value Object - 비밀번호 값 객체."""

import re
from dataclasses import dataclass

from passlib.context import CryptContext

from app.domain.exceptions.validation import WeakPasswordError

# bcrypt 암호화 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@dataclass
class Password:
    """비밀번호 값 객체.

    비밀번호 강도 검증과 해싱 기능을 포함합니다.

    Attributes:
        value: 평문 비밀번호 (메모리에서만 유지)
    """

    value: str

    # 비밀번호 정책
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True

    def __post_init__(self) -> None:
        """생성 후 유효성 검증."""
        self._validate()

    def _validate(self) -> None:
        """비밀번호 강도를 검증합니다."""
        if not self.value:
            raise WeakPasswordError("비밀번호는 필수입니다.")

        if len(self.value) < self.MIN_LENGTH:
            raise WeakPasswordError(
                f"비밀번호는 최소 {self.MIN_LENGTH}자 이상이어야 합니다."
            )

        if len(self.value) > self.MAX_LENGTH:
            raise WeakPasswordError(
                f"비밀번호는 최대 {self.MAX_LENGTH}자 이내여야 합니다."
            )

        if self.REQUIRE_UPPERCASE and not re.search(r"[A-Z]", self.value):
            raise WeakPasswordError("비밀번호에 대문자가 포함되어야 합니다.")

        if self.REQUIRE_LOWERCASE and not re.search(r"[a-z]", self.value):
            raise WeakPasswordError("비밀번호에 소문자가 포함되어야 합니다.")

        if self.REQUIRE_DIGIT and not re.search(r"\d", self.value):
            raise WeakPasswordError("비밀번호에 숫자가 포함되어야 합니다.")

        if self.REQUIRE_SPECIAL and not re.search(
            r"[!@#$%^&*(),.?\":{}|<>]", self.value
        ):
            raise WeakPasswordError("비밀번호에 특수문자가 포함되어야 합니다.")

    def hash(self) -> str:
        """비밀번호를 해시합니다.

        Returns:
            str: bcrypt 해시된 비밀번호
        """
        return pwd_context.hash(self.value)

    def verify(self, hashed_password: str) -> bool:
        """해시된 비밀번호와 비교합니다.

        Args:
            hashed_password: 저장된 해시 비밀번호

        Returns:
            bool: 일치 여부
        """
        return pwd_context.verify(self.value, hashed_password)

    @staticmethod
    def verify_hash(plain_password: str, hashed_password: str) -> bool:
        """정적 메서드로 비밀번호를 검증합니다.

        Args:
            plain_password: 평문 비밀번호
            hashed_password: 해시된 비밀번호

        Returns:
            bool: 일치 여부
        """
        return pwd_context.verify(plain_password, hashed_password)

    def __repr__(self) -> str:
        """디버그용 문자열 표현 (보안상 값 숨김)."""
        return "Password(***)"

    def __str__(self) -> str:
        """문자열 표현 (보안상 값 숨김)."""
        return "***"
