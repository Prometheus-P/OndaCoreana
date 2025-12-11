# Feature Specification: Astro MVP Polish

**Feature Branch**: `004-astro-mvp-polish`
**Created**: 2025-12-12
**Status**: Draft
**Input**: Astro MVP 완성도 향상 - 레포 구조 분석 후 가장 시급한 작업 3가지 선정 및 구현

## Current State Analysis

### Already Implemented (Phase 1 Complete)

- **Pages**: index, dramas, kpop, noticias, guias (목록 + 상세), buscar, 404, admin
- **Layouts**: BaseLayout, ArticleLayout, AdminLayout
- **Components**: SEOHead, JsonLd, SearchInput, SearchFilters, SearchResults, ShareButtons
- **Content Collections**: dramas(4), kpop(4), noticias(10), guias(3), features(1)
- **SEO**: sitemap, robots.txt, OG tags, Twitter cards, JSON-LD (WebSite, Organization)

### Identified Gaps (시급한 작업)

1. **브랜드 불일치**: Header/Footer에 "HallyuLatino" 표시, 실제 브랜드는 "OndaCoreana"
2. **Legal 페이지 누락**: /privacidad, /terminos 링크 존재하나 페이지 없음
3. **Newsletter 기능 미작동**: 폼은 있으나 실제 동작하지 않음 (placeholder)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Brand Consistency (Priority: P1)

사용자가 사이트를 방문했을 때 일관된 브랜드 "OndaCoreana"를 경험한다.

**Why this priority**: 브랜드 혼란은 신뢰도를 저하시키고 SEO에도 부정적 영향을 미침. 가장 기본적인 수정.

**Independent Test**: 모든 페이지에서 Header/Footer의 브랜드명이 "OndaCoreana"로 표시되는지 확인

**Acceptance Scenarios**:

1. **Given** 사용자가 홈페이지에 접속, **When** Header를 확인, **Then** "OndaCoreana" 로고/텍스트가 표시됨
2. **Given** 사용자가 어떤 페이지에든 접속, **When** Footer를 확인, **Then** "OndaCoreana" 브랜드명과 저작권 표시가 보임
3. **Given** 검색엔진이 사이트를 크롤링, **When** JSON-LD를 파싱, **Then** Organization name이 "OndaCoreana"로 표시됨

---

### User Story 2 - Legal Pages Accessibility (Priority: P2)

사용자가 개인정보처리방침과 이용약관을 확인할 수 있다.

**Why this priority**: 법적 요구사항이며, 광고 네트워크(AdSense, Mediavine) 승인에 필수

**Independent Test**: /privacidad, /terminos 페이지 접속 시 적절한 내용이 표시됨

**Acceptance Scenarios**:

1. **Given** 사용자가 Footer에서 "Política de Privacidad" 클릭, **When** 페이지 로드, **Then** 개인정보처리방침 내용이 표시됨
2. **Given** 사용자가 Footer에서 "Términos de Uso" 클릭, **When** 페이지 로드, **Then** 이용약관 내용이 표시됨
3. **Given** 404 에러 발생, **When** Legal 페이지 접속 시도, **Then** 404가 아닌 정상 페이지 표시

---

### User Story 3 - Newsletter Form UX (Priority: P3)

사용자가 뉴스레터 폼을 제출했을 때 적절한 피드백을 받는다.

**Why this priority**: 현재 폼이 동작하지 않아 사용자 경험 저하. 실제 이메일 수집은 Phase 3에서 구현.

**Independent Test**: 폼 제출 시 사용자에게 피드백 메시지가 표시됨

**Acceptance Scenarios**:

1. **Given** 사용자가 유효한 이메일 입력, **When** "Suscribirse" 클릭, **Then** "¡Gracias! Te avisaremos cuando lancemos el boletín." 메시지 표시
2. **Given** 사용자가 유효하지 않은 이메일 입력, **When** 제출 시도, **Then** HTML5 validation 에러 표시
3. **Given** 폼 제출 성공, **When** 페이지 새로고침, **Then** 폼이 초기 상태로 리셋

---

### Edge Cases

- Legal 페이지에 직접 접근 시에도 SEO 메타태그가 적절히 설정되어야 함
- Newsletter 폼이 모바일에서도 올바르게 동작해야 함
- 브랜드 변경 시 기존 소셜 미디어 링크(@hallyulatino)는 유지 (별도 계정)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 모든 페이지의 Header에 "OndaCoreana" 브랜드를 표시해야 함
- **FR-002**: 시스템은 모든 페이지의 Footer에 "OndaCoreana" 브랜드와 저작권을 표시해야 함
- **FR-003**: 시스템은 /privacidad 경로에서 개인정보처리방침 페이지를 제공해야 함
- **FR-004**: 시스템은 /terminos 경로에서 이용약관 페이지를 제공해야 함
- **FR-005**: Newsletter 폼은 제출 시 사용자에게 시각적 피드백을 제공해야 함
- **FR-006**: JSON-LD Organization schema에 "OndaCoreana" 이름이 포함되어야 함

### Key Entities

- **Legal Page**: 정적 콘텐츠 페이지 (title, content, lastUpdated)
- **Newsletter Subscription**: 이메일 주소, 제출 상태 (UI only, 백엔드 미구현)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 모든 페이지에서 "OndaCoreana" 브랜드가 일관되게 표시됨 (100% 일치)
- **SC-002**: /privacidad, /terminos 페이지가 200 OK 응답을 반환함
- **SC-003**: Newsletter 폼 제출 후 3초 이내에 피드백 메시지가 표시됨
- **SC-004**: Lighthouse SEO 점수 90+ 유지
- **SC-005**: 빌드 시 TypeScript 에러 0건

## Assumptions

- 소셜 미디어 계정(@hallyulatino)은 별도 브랜드로 유지 (변경 안 함)
- Legal 페이지는 스페인어로만 제공 (pt-BR 확장은 향후)
- Newsletter 백엔드는 Phase 3에서 구현, 현재는 UI 피드백만 제공
