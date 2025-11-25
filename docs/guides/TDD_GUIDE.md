---
title: HallyuLatino TDD 가이드
version: 1.0.0
status: Draft
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
language: Korean (한국어)
---

# TDD_GUIDE.md - TDD 개발 가이드

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @hallyulatino-team | 최초 작성 |

---

## 1. TDD란?

**Test-Driven Development (테스트 주도 개발)**은 테스트를 먼저 작성하고, 그 테스트를 통과하는 코드를 작성하는 개발 방법론입니다.

### 1.1 TDD 사이클

```
┌─────────────────────────────────────────────────────────────┐
│                    TDD Cycle (Red-Green-Refactor)           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌─────────┐                                         │
│         │   RED   │  1. 실패하는 테스트 작성                  │
│         │  (Fail) │     - 구현하려는 기능 정의                │
│         └────┬────┘     - 테스트 실행 → 실패 확인             │
│              │                                              │
│              ▼                                              │
│         ┌─────────┐                                         │
│         │  GREEN  │  2. 테스트를 통과하는 최소 코드 작성       │
│         │ (Pass)  │     - 가능한 빠르게 통과시키기             │
│         └────┬────┘     - 완벽한 코드가 아니어도 OK           │
│              │                                              │
│              ▼                                              │
│         ┌──────────┐                                        │
│         │ REFACTOR │  3. 코드 개선                           │
│         │(Improve) │     - 중복 제거                         │
│         └────┬─────┘     - 가독성 향상                       │
│              │           - 테스트는 계속 통과해야 함           │
│              │                                              │
│              └─────────────────────────────────────┐        │
│                                                    │        │
│              ┌─────────────────────────────────────┘        │
│              ▼                                              │
│         [다음 기능으로 반복]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 TDD의 장점

| 장점 | 설명 |
|------|------|
| 🎯 **명확한 목표** | 테스트가 명세서 역할 |
| 🛡️ **회귀 방지** | 변경 시 기존 기능 보호 |
| 📝 **문서화** | 테스트가 사용 예시 |
| 🧩 **좋은 설계** | 테스트 가능한 코드 = 좋은 설계 |
| 😌 **자신감** | 리팩토링에 대한 두려움 감소 |

---

## 2. 테스트 작성 규칙

### 2.1 테스트 명명 규칙

```python
# 패턴: test_should_{expected}_when_{condition}

# ✅ 좋은 예
def test_should_return_user_when_valid_id_provided():
    """유효한 ID가 제공되면 사용자를 반환해야 한다"""
    pass

def test_should_raise_error_when_email_already_exists():
    """이메일이 이미 존재하면 에러를 발생시켜야 한다"""
    pass

def test_should_authenticate_user_when_correct_password():
    """올바른 비밀번호면 사용자를 인증해야 한다"""
    pass


# ❌ 나쁜 예
def test_user():  # 무엇을 테스트하는지 불명확
    pass

def test_1():  # 의미 없는 이름
    pass

def test_it_works():  # 너무 모호함
    pass
```

### 2.2 테스트 구조 (AAA 패턴)

```python
def test_should_calculate_total_price_with_discount():
    """할인이 적용된 총 가격을 계산해야 한다"""

    # Arrange (준비)
    # 테스트에 필요한 데이터와 객체를 준비한다
    cart = ShoppingCart()
    cart.add_item(Item(name="K-Drama DVD", price=30000))
    cart.add_item(Item(name="K-Pop Album", price=20000))
    discount = PercentageDiscount(10)  # 10% 할인

    # Act (실행)
    # 테스트하려는 동작을 수행한다
    total = cart.calculate_total(discount)

    # Assert (검증)
    # 결과가 예상과 일치하는지 확인한다
    assert total == 45000  # 50000 - 10% = 45000
```

### 2.3 테스트 독립성

```python
# ✅ 좋은 예: 각 테스트가 독립적
class TestUserService:

    def setup_method(self):
        """각 테스트 전에 실행되는 설정"""
        self.db = create_test_database()
        self.service = UserService(self.db)

    def teardown_method(self):
        """각 테스트 후에 실행되는 정리"""
        self.db.clear()

    def test_should_create_user(self):
        user = self.service.create(email="test@example.com")
        assert user.id is not None

    def test_should_find_user_by_email(self):
        # 이 테스트는 위 테스트에 의존하지 않음
        self.service.create(email="find@example.com")
        user = self.service.find_by_email("find@example.com")
        assert user is not None


# ❌ 나쁜 예: 테스트 간 의존성
class TestUserServiceBad:
    created_user_id = None  # 공유 상태!

    def test_1_create_user(self):
        user = self.service.create(email="test@example.com")
        TestUserServiceBad.created_user_id = user.id  # 상태 저장

    def test_2_find_user(self):
        # test_1에 의존! test_1이 실패하면 이 테스트도 실패
        user = self.service.find(TestUserServiceBad.created_user_id)
```

---

## 3. 테스트 유형별 가이드

### 3.1 단위 테스트 (Unit Test)

```python
# tests/unit/services/test_auth_service.py

import pytest
from unittest.mock import Mock, patch

from app.services.auth import AuthService
from app.domain.entities import User
from app.domain.exceptions import InvalidCredentialsError


class TestAuthService:
    """인증 서비스 단위 테스트"""

    def setup_method(self):
        """테스트 설정"""
        self.user_repository = Mock()
        self.token_service = Mock()
        self.auth_service = AuthService(
            user_repository=self.user_repository,
            token_service=self.token_service
        )

    def test_should_return_tokens_when_credentials_valid(self):
        """유효한 자격증명으로 로그인 시 토큰을 반환해야 한다"""
        # Arrange
        mock_user = Mock(spec=User)
        mock_user.verify_password.return_value = True
        mock_user.id = "user_123"
        self.user_repository.find_by_email.return_value = mock_user
        self.token_service.create_access_token.return_value = "access_token"
        self.token_service.create_refresh_token.return_value = "refresh_token"

        # Act
        result = self.auth_service.authenticate(
            email="user@example.com",
            password="correct_password"
        )

        # Assert
        assert result.access_token == "access_token"
        assert result.refresh_token == "refresh_token"
        mock_user.verify_password.assert_called_once_with("correct_password")

    def test_should_raise_error_when_user_not_found(self):
        """사용자를 찾을 수 없으면 에러를 발생시켜야 한다"""
        # Arrange
        self.user_repository.find_by_email.return_value = None

        # Act & Assert
        with pytest.raises(InvalidCredentialsError):
            self.auth_service.authenticate(
                email="nonexistent@example.com",
                password="any_password"
            )

    def test_should_raise_error_when_password_wrong(self):
        """비밀번호가 틀리면 에러를 발생시켜야 한다"""
        # Arrange
        mock_user = Mock(spec=User)
        mock_user.verify_password.return_value = False
        self.user_repository.find_by_email.return_value = mock_user

        # Act & Assert
        with pytest.raises(InvalidCredentialsError):
            self.auth_service.authenticate(
                email="user@example.com",
                password="wrong_password"
            )
```

### 3.2 통합 테스트 (Integration Test)

```python
# tests/integration/test_auth_api.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db, Base


@pytest.fixture(scope="module")
def test_db():
    """테스트 데이터베이스 설정"""
    engine = create_engine("postgresql://test:test@localhost/test_db")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """테스트 클라이언트"""
    return TestClient(app)


class TestAuthAPI:
    """인증 API 통합 테스트"""

    def test_should_register_user_successfully(self, client):
        """유효한 정보로 회원가입이 성공해야 한다"""
        # Act
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecureP@ss123",
                "nickname": "newuser",
                "country": "MX",
                "language": "es",
                "terms_agreed": True,
                "privacy_agreed": True
            }
        )

        # Assert
        assert response.status_code == 201
        data = response.json()["data"]
        assert data["email"] == "newuser@example.com"
        assert "user_id" in data

    def test_should_login_with_registered_user(self, client):
        """등록된 사용자로 로그인이 성공해야 한다"""
        # Arrange: 먼저 회원가입
        client.post("/api/v1/auth/register", json={
            "email": "login@example.com",
            "password": "SecureP@ss123",
            "nickname": "loginuser",
            "country": "BR",
            "language": "pt",
            "terms_agreed": True,
            "privacy_agreed": True
        })

        # Act: 로그인
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "login@example.com",
                "password": "SecureP@ss123"
            }
        )

        # Assert
        assert response.status_code == 200
        data = response.json()["data"]
        assert "access_token" in data
        assert "refresh_token" in data

    def test_should_reject_duplicate_email(self, client):
        """중복 이메일로 회원가입 시 실패해야 한다"""
        # Arrange
        user_data = {
            "email": "duplicate@example.com",
            "password": "SecureP@ss123",
            "nickname": "user1",
            "country": "MX",
            "language": "es",
            "terms_agreed": True,
            "privacy_agreed": True
        }
        client.post("/api/v1/auth/register", json=user_data)

        # Act: 같은 이메일로 다시 등록
        user_data["nickname"] = "user2"
        response = client.post("/api/v1/auth/register", json=user_data)

        # Assert
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"
```

---

## 4. 테스트 커버리지

### 4.1 커버리지 목표

| 테스트 유형 | 목표 | 측정 방법 |
|-------------|------|-----------|
| Unit Test | 80% | Line Coverage |
| Integration Test | 60% | Branch Coverage |
| E2E Test | Critical Path 100% | Scenario Coverage |

### 4.2 커버리지 실행

```bash
# 백엔드 커버리지
cd src/backend
pytest --cov=app --cov-report=html --cov-report=term-missing

# 프론트엔드 커버리지
cd src/frontend
npm run test -- --coverage
```

### 4.3 커버리지 리포트 예시

```
---------- coverage: platform linux, python 3.12.0 -----------
Name                              Stmts   Miss  Cover   Missing
---------------------------------------------------------------
app/services/auth.py                 45      2    96%   78-79
app/services/user.py                 38      5    87%   45-48, 62
app/repositories/user_repository.py  52      8    85%   34-41
---------------------------------------------------------------
TOTAL                               135     15    89%
```

---

## 5. 모킹 (Mocking)

### 5.1 외부 의존성 모킹

```python
from unittest.mock import Mock, patch, AsyncMock

class TestTranslationService:
    """번역 서비스 테스트 - 외부 API 모킹"""

    @patch("app.services.translation.openai_client")
    def test_should_translate_korean_to_spanish(self, mock_openai):
        """한국어를 스페인어로 번역해야 한다"""
        # Arrange
        mock_openai.chat.completions.create.return_value = Mock(
            choices=[Mock(message=Mock(content="Hola mundo"))]
        )
        service = TranslationService()

        # Act
        result = service.translate("안녕하세요", source="ko", target="es")

        # Assert
        assert result == "Hola mundo"
        mock_openai.chat.completions.create.assert_called_once()


class TestPaymentService:
    """결제 서비스 테스트 - Stripe 모킹"""

    @patch("app.services.payment.stripe")
    def test_should_create_subscription(self, mock_stripe):
        """구독을 생성해야 한다"""
        # Arrange
        mock_stripe.Subscription.create.return_value = Mock(
            id="sub_123",
            status="active"
        )
        service = PaymentService()

        # Act
        result = service.create_subscription(
            customer_id="cus_123",
            price_id="price_premium"
        )

        # Assert
        assert result.subscription_id == "sub_123"
        assert result.status == "active"
```

---

## 6. 테스트 피라미드

```
                    ┌───────────┐
                    │   E2E     │  적은 수, 느림, 비용 높음
                    │  Tests    │
                    ├───────────┤
                    │Integration│  중간 수
                    │  Tests    │
                    ├───────────┤
                    │   Unit    │  많은 수, 빠름, 비용 낮음
                    │  Tests    │
                    └───────────┘
```

| 레벨 | 특징 | 비율 |
|------|------|------|
| Unit | 빠름, 격리됨, 많이 작성 | 70% |
| Integration | DB/API 연동, 중간 속도 | 20% |
| E2E | 전체 흐름, 느림, 적게 작성 | 10% |

---

## 7. TDD 체크리스트

### 테스트 작성 전
- [ ] 구현하려는 기능이 명확한가?
- [ ] 테스트 케이스를 먼저 나열했는가?
- [ ] 경계 조건과 에러 케이스를 고려했는가?

### 테스트 작성 중
- [ ] 테스트 이름이 명확한가?
- [ ] AAA 패턴을 따르는가?
- [ ] 하나의 테스트에 하나의 검증만 하는가?

### 테스트 작성 후
- [ ] 모든 테스트가 통과하는가?
- [ ] 코드 커버리지가 목표를 달성했는가?
- [ ] 리팩토링 후에도 테스트가 통과하는가?

---

*이 가이드는 팀의 TDD 실천을 위한 기준 문서입니다.*
