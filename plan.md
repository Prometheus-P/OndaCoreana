---
title: OndaCorea - Development Plan (TDD)
version: 1.0.0
status: Active
owner: @OndaCorea-team
created: 2024-11-28
updated: 2024-11-28
reviewers: []
---

# plan.md - TDD 개발 플랜

> **이 문서는 실시간으로 업데이트되는 개발 플랜입니다.**
> TDD 사이클에 따라 태스크를 추적하고, 완료 시 체크합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2024-11-28 | @claude | Astro 마이그레이션, 문서화, TDD 인프라 완성 |

---

## 현재 상태 요약

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROJECT STATUS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Phase: 1 - Foundation ✅ COMPLETE                                      │
│  Version: 1.0.0                                                         │
│  Branch: feat/astro-migration                                           │
│  Last Build: ✅ Success (17 pages)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Progress: ████████████████░░░░ 80%                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (현재)

### 1.1 프로젝트 설정 ✅

- [x] Astro 5.x 프로젝트 초기화
- [x] Tailwind CSS 4.x 통합
- [x] MDX 통합
- [x] Sitemap 통합
- [x] TypeScript strict 모드 설정
- [x] pnpm 패키지 매니저 설정

### 1.2 레이아웃 & 컴포넌트 ✅

- [x] `BaseLayout.astro` - 기본 레이아웃 (헤더, 푸터, 네비게이션)
- [x] `ArticleLayout.astro` - 기사 상세 레이아웃
- [x] `SEOHead.astro` - 메타 태그 컴포넌트
- [x] `JsonLd.astro` - Schema.org 구조화 데이터

### 1.3 Content Collections ✅

- [x] `src/content/config.ts` - 스키마 정의
- [x] `dramas` 컬렉션 스키마
- [x] `kpop` 컬렉션 스키마
- [x] `noticias` 컬렉션 스키마
- [x] `guias` 컬렉션 스키마

### 1.4 페이지 라우팅 ✅

- [x] `/` - 홈페이지
- [x] `/dramas` - K-Drama 목록
- [x] `/dramas/[slug]` - K-Drama 상세
- [x] `/kpop` - K-Pop 목록
- [x] `/kpop/[slug]` - K-Pop 상세
- [x] `/noticias` - 뉴스 목록
- [x] `/noticias/[slug]` - 뉴스 상세
- [x] `/guias` - 가이드 목록
- [x] `/guias/[slug]` - 가이드 상세

### 1.5 SEO 기본 설정 ✅

- [x] `robots.txt`
- [x] Sitemap 자동 생성 (`/sitemap-index.xml`)
- [x] Open Graph 메타 태그
- [x] Twitter Cards 메타 태그
- [x] Canonical URL
- [x] hreflang (es-MX)

### 1.6 문서화 ✅

- [x] `CONTEXT.md` - 프로젝트 컨텍스트
- [x] `README.md` - 프로젝트 소개
- [x] `ENVIRONMENT.md` - 환경 설정 가이드
- [x] `plan.md` - 개발 플랜 (이 문서)

### 1.7 샘플 콘텐츠 ✅

- [x] K-Drama 샘플 4개
  - `reina-de-las-lagrimas.mdx`
  - `crash-landing-on-you.mdx`
  - `goblin.mdx`
  - `squid-game.mdx`
- [x] K-Pop 샘플 4개
  - `aespa.mdx`
  - `bts.mdx`
  - `blackpink.mdx`
  - `newjeans.mdx`
- [x] 뉴스 샘플 1개 (`bts-regreso-2025.mdx`)
- [x] 가이드 샘플 3개
  - `donde-ver-kdramas-latinoamerica.mdx`
  - `aprender-coreano-desde-cero.mdx`
  - `guia-viaje-corea-del-sur.mdx`

---

## Phase 2: Content & SEO (다음)

### 2.1 콘텐츠 확장

| 카테고리 | 목표 | 현재 | 상태 |
|---------|------|------|------|
| K-Dramas | 10개 | 4개 | 🔄 40% |
| K-Pop | 10개 | 4개 | 🔄 40% |
| Noticias | 10개 | 1개 | 🔄 10% |
| Guías | 5개 | 3개 | 🔄 60% |

### 2.2 SEO 고급 설정

- [ ] Google Analytics 4 연동
  - [ ] `PUBLIC_GA_MEASUREMENT_ID` 환경 변수
  - [ ] GA 스크립트 추가
  - [ ] 이벤트 트래킹 설정

- [ ] Google Search Console 등록
  - [ ] 사이트 소유권 확인
  - [ ] Sitemap 제출
  - [ ] 인덱싱 요청

- [ ] OG 이미지 최적화
  - [ ] 기본 OG 이미지 생성 (1200x630)
  - [ ] 콘텐츠별 OG 이미지 템플릿

### 2.3 성능 최적화

- [ ] Lighthouse 점수 측정 (기준선)
- [ ] 이미지 최적화 (WebP 변환)
- [ ] Critical CSS 인라인
- [ ] 폰트 최적화 (system-ui 사용 중)

### 2.4 UI 개선

- [ ] 404 페이지 커스텀
- [ ] 로딩 상태 UI
- [ ] 스크롤 투 탑 버튼
- [ ] 공유 버튼 (Twitter, Facebook, WhatsApp)

---

## Phase 3: Features (향후)

### 3.1 검색 기능

- [ ] 클라이언트 사이드 검색 (Fuse.js)
- [ ] 또는 Algolia DocSearch 통합
- [ ] 검색 결과 페이지
- [ ] 검색 UI 컴포넌트

### 3.2 필터링 & 정렬

- [ ] K-Drama 필터 (장르, 년도, 방송사)
- [ ] K-Pop 필터 (타입, 소속사)
- [ ] 뉴스 카테고리 필터
- [ ] 정렬 옵션 (최신순, 인기순)

### 3.3 뉴스레터

- [ ] 구독 폼 컴포넌트
- [ ] 이메일 서비스 연동 (Buttondown/Mailchimp)
- [ ] 구독 확인 페이지

### 3.4 다크 모드

- [ ] 테마 토글 컴포넌트
- [ ] Tailwind 다크 모드 설정
- [ ] 시스템 설정 감지
- [ ] 로컬 스토리지 저장

---

## Phase 4: Monetization (향후)

### 4.1 광고 통합

- [ ] Google AdSense 신청
- [ ] 광고 배치 전략 수립
- [ ] 광고 컴포넌트 생성
- [ ] 광고 성능 추적

### 4.2 Mediavine 준비 (50K 세션 달성 시)

- [ ] 트래픽 목표 달성 확인
- [ ] Mediavine 신청
- [ ] 광고 코드 교체

---

## 다음 태스크 (Next Actions)

### 즉시 실행 가능

```
┌─────────────────────────────────────────────────────────────────────────┐
│ NEXT: 샘플 콘텐츠 추가                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. K-Drama 추가 콘텐츠 3개 작성                                          │
│    - Crash Landing on You                                               │
│    - Goblin                                                             │
│    - Squid Game                                                         │
│                                                                         │
│ 2. K-Pop 추가 콘텐츠 3개 작성                                            │
│    - BTS                                                                │
│    - BLACKPINK                                                          │
│    - NewJeans                                                           │
│                                                                         │
│ 3. 가이드 추가 콘텐츠 2개 작성                                           │
│    - Cómo aprender coreano desde cero                                   │
│    - Guía de viaje a Corea del Sur                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 명령어

```bash
# TDD 사이클 시작
go

# 특정 콘텐츠 생성
generate content dramas/crash-landing-on-you

# 특정 기능 구현
generate feature search
```

---

## TDD 사이클 가이드

### Red-Green-Refactor

```
┌─────────┐     ┌─────────┐     ┌───────────┐
│  RED    │ ──▶ │  GREEN  │ ──▶ │ REFACTOR  │
│ (실패)   │     │ (통과)   │     │ (개선)     │
└─────────┘     └─────────┘     └───────────┘
```

### 콘텐츠 TDD 사이클

1. **Red**: 콘텐츠 파일 생성, frontmatter 검증 실패
2. **Green**: 올바른 frontmatter 작성, 빌드 통과
3. **Refactor**: 내용 개선, SEO 최적화

### 기능 TDD 사이클

1. **Red**: 테스트 작성 (Playwright E2E)
2. **Green**: 최소 구현
3. **Refactor**: 코드 정리, 성능 개선

---

## 품질 체크리스트

### 빌드 전 확인

- [ ] `pnpm check` 통과 (TypeScript)
- [ ] `pnpm build` 성공
- [ ] 모든 콘텐츠 frontmatter 유효

### 배포 전 확인

- [ ] Lighthouse 점수 90+ (모든 카테고리)
- [ ] 모바일 반응형 확인
- [ ] 링크 깨짐 없음
- [ ] 이미지 alt 태그 존재

### 콘텐츠 품질 확인

- [ ] title: 60자 이내
- [ ] description: 160자 이내
- [ ] heroImage 존재 및 최적화
- [ ] 맞춤법 검사 완료

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| [CONTEXT.md](./CONTEXT.md) | 프로젝트 전체 컨텍스트 |
| [README.md](./README.md) | 빠른 시작 가이드 |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | 환경 설정 |

---

## 메트릭 추적

### 개발 진행률

| Phase | 진행률 | 상태 |
|-------|--------|------|
| Phase 1: Foundation | 100% | ✅ 완료 |
| Phase 2: Content & SEO | 30% | 🔄 진행 중 |
| Phase 3: Features | 0% | ⏳ 대기 |
| Phase 4: Monetization | 0% | ⏳ 대기 |

### 콘텐츠 현황

| 컬렉션 | 작성 | 목표 | 진행률 |
|--------|------|------|--------|
| dramas | 4 | 10 | 40% |
| kpop | 4 | 10 | 40% |
| noticias | 1 | 10 | 10% |
| guias | 3 | 5 | 60% |

---

*이 문서는 개발 진행에 따라 실시간 업데이트됩니다.*
*마지막 업데이트: 2024-11-28*
