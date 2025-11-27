# Changelog

이 프로젝트의 모든 주요 변경사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added
- Phase 5: AI 번역 서비스 (예정)
- Phase 6: 추천 시스템 (예정)
- Phase 8: 통합 테스트 및 QA (예정)

---

## [0.4.0-alpha.2] - 2025-11-27

### Added
- **Phase 4 Content API 완성**
  - `SupabaseContentRepository` 구현 (Supabase PostgreSQL 연동)
  - Content REST API 엔드포인트 (GET, POST, PATCH, DELETE)
  - 콘텐츠 검색 기능 (`search`, `count_search`)
  - 선택적 인증 패턴 (`get_current_user_optional`)
  - Content 통합 테스트 14개 추가

- **문서화**
  - `docs/MANUAL_SETUP.md` - 수동 설정 작업 가이드

### Changed
- API 엔드포인트에서 Use Case 반환값 직접 사용 (중복 변환 제거)
- Use Case에 `search` 파라미터 지원 추가

---

## [0.4.0-alpha.1] - 2025-11-27

### Added
- **Phase 4 콘텐츠 서비스 기초 구현**
  - `Content` 도메인 엔티티 (다국어 지원: ko, es, pt)
  - `ContentRepository` 인터페이스 정의
  - Content CRUD Use Cases (Get, List, Create, Update, Delete)
  - Content DTOs (Response, Summary, List, Create/Update Request, Filter)
  - Content 예외 클래스 (NotFound, NotViewable, InvalidData)
  - 14개 콘텐츠 테스트 추가

- **테스트 인프라 개선**
  - E2E 테스트 환경 구성 (Playwright)
  - 프론트엔드 Jest 테스트 환경 구성
  - LoginForm 컴포넌트 테스트 추가
  - 백엔드 단위 테스트 확장 (81개 테스트 통과)

- **설정 이슈 문서화**
  - `.github/ISSUES/` 폴더에 설정 이슈 7개 추가
  - Supabase, Google OAuth, AI 서비스, n8n, 결제, 배포, 보안 설정 가이드

### Changed
- Pydantic v2 `ConfigDict` 패턴 적용 (deprecated `class Config` 제거)
- `datetime.utcnow()` → timezone-aware `utc_now()` 헬퍼 함수로 마이그레이션
- 문서 구조 개선 (`plan.md`, 가이드 문서 → `docs/` 디렉토리로 이동)

### Fixed
- bcrypt 72-byte 제한 문제 해결 (passlib → 직접 bcrypt 사용)
- 통합 테스트 Supabase 연결 문제 해결 (FastAPI dependency_overrides 활용)
- Pydantic ValidationError 테스트 수정
- series_id 빈 문자열 UUID 파싱 에러 방지
- bcrypt 잘못된 해시 예외 처리 (ValueError/TypeError → False 반환)

---

## [0.3.0] - 2025-11-25

### Added
- **Phase 3 사용자 서비스 완료**
  - 사용자 프로필 관리 (조회, 수정)
  - 시청 기록 기능 (기록, 이어보기, 목록 조회)
  - 즐겨찾기 기능 (추가, 삭제, 중복 방지)
  - 관련 도메인 모델, Repository, Use Cases 구현
  - API 엔드포인트 구현

- **프론트엔드 프로필 UI 구현**
  - 프로필 페이지 (`/profile`)
  - 프로필 편집 페이지 (`/profile/edit`)

### Changed
- README.md 기술 스택 업데이트 (Supabase, Pydantic 2 반영)

---

## [0.2.0] - 2025-11-25

### Added
- **Phase 2 인증 서비스 완료**
  - 사용자 등록 (이메일/비밀번호 검증, 해시 저장)
  - 로그인/로그아웃 (JWT Access/Refresh 토큰)
  - 토큰 갱신 기능
  - Google OAuth 연동
  - JWTService, AuthenticationService, OAuthService 구현

### Security
- 비밀번호 bcrypt 해싱
- JWT 토큰 기반 인증

---

## [0.1.0] - 2025-11-25

### Added
- **Phase 1 인프라 설정 완료**
  - 백엔드 프로젝트 초기화 (Clean Architecture)
  - 프론트엔드 프로젝트 초기화 (Next.js 14)
  - Docker Compose 설정
  - CI/CD 파이프라인 설정 (GitHub Actions)
  - PostgreSQL 스키마 설계 (users 테이블)
  - Alembic 마이그레이션 설정
  - Redis 연결 설정

- **프로젝트 문서화**
  - CONTEXT.md - 프로젝트 Single Source of Truth
  - PRD.md - 제품 요구사항 문서
  - ARCHITECTURE.md - 시스템 아키텍처
  - TDD_GUIDE.md - TDD 개발 가이드
  - VERSIONING_GUIDE.md - 버전 관리 가이드

---

## 버전 관리 규칙

### Semantic Versioning
- **MAJOR**: 하위 호환되지 않는 API 변경
- **MINOR**: 하위 호환되는 새 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

### Pre-release 버전
- `alpha`: 초기 개발, 불안정
- `beta`: 기능 완료, 테스트 중
- `rc`: 릴리스 후보, 최종 테스트

---

[Unreleased]: https://github.com/Prometheus-P/hallyulatino/compare/v0.4.0-alpha.2...HEAD
[0.4.0-alpha.2]: https://github.com/Prometheus-P/hallyulatino/compare/v0.4.0-alpha.1...v0.4.0-alpha.2
[0.4.0-alpha.1]: https://github.com/Prometheus-P/hallyulatino/compare/v0.3.0...v0.4.0-alpha.1
[0.3.0]: https://github.com/Prometheus-P/hallyulatino/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Prometheus-P/hallyulatino/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Prometheus-P/hallyulatino/releases/tag/v0.1.0
