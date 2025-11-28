---
title: HallyuLatino - Project Context (Single Source of Truth)
version: 1.0.0
status: Approved
owner: @hallyulatino-team
created: 2024-11-28
updated: 2024-11-28
reviewers: []
---

# CONTEXT.md - HallyuLatino Project

> **이 문서는 프로젝트의 Single Source of Truth입니다.**
> AI 에이전트와 인간 개발자 모두 이 문서를 참조하여 프로젝트 컨텍스트를 이해합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2024-11-28 | @claude | Astro SSG 마이그레이션 후 최초 작성 |

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보

| 항목 | 값 |
|------|-----|
| **프로젝트명** | HallyuLatino |
| **도메인** | https://hallyulatino.com |
| **설명** | 스페인어권 사용자를 위한 K-Culture (K-Drama, K-Pop) 정보 포털 |
| **언어** | 스페인어 (es-MX, es-419) |
| **버전** | 1.0.0 |
| **라이선스** | MIT |

### 1.2 비전 & 미션

```
┌─────────────────────────────────────────────────────────────────────────┐
│ VISION                                                                  │
│ "라틴아메리카 최고의 K-Culture 정보 허브가 된다"                           │
├─────────────────────────────────────────────────────────────────────────┤
│ MISSION                                                                 │
│ 한국 엔터테인먼트 정보를 스페인어로 빠르고 정확하게 전달하여               │
│ 라틴아메리카 K-Culture 팬들의 정보 격차를 해소한다                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 핵심 목표 (North Star Metrics)

| 지표 | 목표 | 기간 |
|------|------|------|
| **월간 세션** | 50,000 | 12개월 |
| **월간 페이지뷰** | 150,000 | 12개월 |
| **평균 세션 시간** | 3분 이상 | 6개월 |
| **Core Web Vitals** | 모두 Good | 즉시 |

### 1.4 수익 모델

```
Phase 1 (0-6개월): Google AdSense
    ↓
Phase 2 (6-12개월): Mediavine (월 50,000 세션 달성 시)
    ↓
Phase 3 (12개월+): 프리미엄 콘텐츠, 스폰서십
```

---

## 2. 타겟 사용자

### 2.1 Primary Persona

```yaml
Name: María García
Age: 18-34세
Location: 멕시코, 콜롬비아, 아르헨티나, 미국 (히스패닉)
Language: 스페인어 (모국어)
Devices: 모바일 70%, 데스크탑 30%
Interests:
  - K-Drama 시청 (Netflix, Viki)
  - K-Pop 팬덤 활동
  - 한국 문화 전반
Pain Points:
  - 한국 엔터테인먼트 정보가 영어/한국어로만 제공됨
  - 스페인어 번역 콘텐츠가 늦거나 부정확함
  - 신뢰할 수 있는 스페인어 K-Culture 미디어 부재
Goals:
  - 최신 K-Drama/K-Pop 정보를 스페인어로 빠르게 얻기
  - 어디서 K-Drama를 볼 수 있는지 알기
  - K-Culture 관련 가이드 (한국 여행, 한국어 학습 등)
```

### 2.2 Traffic Sources (예상)

| 소스 | 비율 | 전략 |
|------|------|------|
| Organic Search (Google) | 60% | SEO 최적화, 롱테일 키워드 |
| Social (TikTok, Instagram) | 25% | 바이럴 콘텐츠, 숏폼 |
| Direct | 10% | 브랜드 인지도 구축 |
| Referral | 5% | 커뮤니티 파트너십 |

---

## 3. 기술 스택

### 3.1 Core Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TECH STACK                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Framework    │ Astro 5.x (Static Site Generation)                     │
│  Styling      │ Tailwind CSS 4.x                                       │
│  Content      │ MDX + Astro Content Collections                        │
│  Language     │ TypeScript (strict mode)                               │
│  Package Mgr  │ pnpm                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Hosting      │ Cloudflare Pages                                       │
│  CDN          │ Cloudflare (built-in)                                  │
│  Domain       │ Cloudflare DNS                                         │
│  Analytics    │ Google Analytics 4 + Search Console                    │
├─────────────────────────────────────────────────────────────────────────┤
│  CI/CD        │ GitHub Actions                                         │
│  Repository   │ GitHub                                                 │
│  Branch       │ main (production), feat/* (features)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Dependencies

```json
{
  "dependencies": {
    "astro": "^5.16.1",
    "@astrojs/mdx": "^4.3.12",
    "@astrojs/sitemap": "^3.6.0",
    "@tailwindcss/vite": "^4.1.17",
    "tailwindcss": "^4.1.17"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.0.0"
  }
}
```

### 3.3 왜 이 스택인가? (ADR Summary)

| 결정 | 이유 |
|------|------|
| **Astro SSG** | SEO 최적화 필수, 정적 HTML 출력으로 Core Web Vitals 최적화 |
| **Tailwind CSS** | 빠른 UI 개발, 작은 CSS 번들 사이즈 |
| **MDX** | 마크다운 기반 콘텐츠 관리 + React 컴포넌트 삽입 가능 |
| **Cloudflare Pages** | 무료 호스팅, 글로벌 CDN, 무제한 대역폭 |
| **TypeScript** | 타입 안정성, AI 코드 생성 정확도 향상 |

---

## 4. 프로젝트 구조

### 4.1 디렉토리 구조

```
📦 hallyulatino/
│
├── 📄 CONTEXT.md                    # 이 파일 (Single Source of Truth)
├── 📄 README.md                     # 프로젝트 소개 & 빠른 시작
├── 📄 plan.md                       # TDD 개발 플랜
├── 📄 astro.config.mjs              # Astro 설정
├── 📄 package.json                  # 의존성
├── 📄 tsconfig.json                 # TypeScript 설정
├── 📄 pnpm-lock.yaml                # 의존성 잠금
│
├── 📁 .github/                      # GitHub 설정
│   └── 📁 workflows/                # CI/CD 파이프라인
│
├── 📁 public/                       # 정적 파일
│   ├── 📄 robots.txt                # 크롤러 설정
│   ├── 📄 favicon.svg               # 파비콘
│   └── 📁 images/                   # 이미지 에셋
│       ├── 📁 dramas/
│       ├── 📁 kpop/
│       ├── 📁 noticias/
│       └── 📁 guias/
│
├── 📁 src/                          # 소스 코드
│   │
│   ├── 📁 components/               # 재사용 컴포넌트
│   │   ├── 📁 seo/                  # SEO 컴포넌트
│   │   │   ├── 📄 SEOHead.astro     # Meta tags (OG, Twitter)
│   │   │   └── 📄 JsonLd.astro      # Schema.org JSON-LD
│   │   └── 📁 ui/                   # UI 컴포넌트
│   │
│   ├── 📁 content/                  # MDX 콘텐츠
│   │   ├── 📄 config.ts             # Content Collections 스키마
│   │   ├── 📁 dramas/               # K-Drama 콘텐츠
│   │   ├── 📁 kpop/                 # K-Pop 콘텐츠
│   │   ├── 📁 noticias/             # 뉴스 콘텐츠
│   │   └── 📁 guias/                # 가이드 콘텐츠
│   │
│   ├── 📁 layouts/                  # 레이아웃 컴포넌트
│   │   ├── 📄 BaseLayout.astro      # 기본 레이아웃
│   │   └── 📄 ArticleLayout.astro   # 기사 레이아웃
│   │
│   ├── 📁 pages/                    # 페이지 라우팅
│   │   ├── 📄 index.astro           # 홈페이지
│   │   ├── 📁 dramas/               # K-Drama 섹션
│   │   │   ├── 📄 index.astro       # 목록 페이지
│   │   │   └── 📄 [...slug].astro   # 상세 페이지
│   │   ├── 📁 kpop/                 # K-Pop 섹션
│   │   ├── 📁 noticias/             # 뉴스 섹션
│   │   └── 📁 guias/                # 가이드 섹션
│   │
│   └── 📁 styles/                   # 글로벌 스타일
│       └── 📄 global.css            # Tailwind 임포트
│
└── 📁 dist/                         # 빌드 출력 (gitignore)
```

### 4.2 Content Collections 스키마

```typescript
// 모든 콘텐츠의 기본 스키마
interface BaseArticle {
  title: string;           // max 60자 (SEO)
  description: string;     // max 160자 (SEO)
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  heroImageAlt?: string;
  author: string;          // default: 'HallyuLatino'
  tags: string[];
  draft: boolean;          // default: false
}

// K-Drama 콘텐츠
interface Drama extends BaseArticle {
  dramaTitle: string;      // 원제
  dramaYear?: number;
  network?: string;        // tvN, JTBC, Netflix
  episodes?: number;
  genre: string[];
  cast: string[];
  whereToWatch: string[];  // Netflix, Viki, KOCOWA
}

// K-Pop 콘텐츠
interface Kpop extends BaseArticle {
  artistName: string;
  artistType: 'solista' | 'grupo' | 'banda';
  agency?: string;         // HYBE, SM, JYP
  debutYear?: number;
  members?: string[];
}

// 뉴스 콘텐츠
interface Noticia extends BaseArticle {
  category: 'drama' | 'kpop' | 'cine' | 'cultura' | 'general';
  breaking: boolean;
  source?: string;
}

// 가이드 콘텐츠
interface Guia extends BaseArticle {
  category: 'streaming' | 'viaje' | 'idioma' | 'cultura' | 'general';
  difficulty?: 'principiante' | 'intermedio' | 'avanzado';
  readingTime?: number;    // 분 단위
}
```

---

## 5. SEO 전략

### 5.1 Technical SEO

| 항목 | 구현 상태 | 설명 |
|------|----------|------|
| **Static HTML** | ✅ | 모든 페이지 pre-rendered (SSG) |
| **Meta Tags** | ✅ | title, description, canonical, OG, Twitter |
| **Schema.org JSON-LD** | ✅ | Article, BreadcrumbList, WebSite, Organization |
| **Sitemap** | ✅ | 자동 생성 (`/sitemap-index.xml`) |
| **robots.txt** | ✅ | 크롤링 허용 설정 |
| **hreflang** | ✅ | es-MX (기본), pt-BR (향후) |
| **Core Web Vitals** | 🎯 | LCP < 2.5s, CLS < 0.1, INP < 200ms |

### 5.2 Content SEO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        KEYWORD STRATEGY                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Primary Keywords (Head):                                               │
│    - "k-dramas en español"                                              │
│    - "k-pop noticias"                                                   │
│    - "doramas coreanos"                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Long-tail Keywords:                                                    │
│    - "donde ver [drama name] en español"                                │
│    - "[artist name] últimas noticias"                                   │
│    - "mejores k-dramas 2024 netflix"                                    │
│    - "guía para viajar a corea del sur"                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Content Types by Intent:                                               │
│    - Informational: 가이드, 리뷰, 프로필                                 │
│    - Navigational: "donde ver X"                                        │
│    - Transactional: N/A (광고 수익 모델)                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 URL 구조

```
/                           # 홈페이지
/dramas                     # K-Drama 목록
/dramas/[slug]              # K-Drama 상세
/kpop                       # K-Pop 목록
/kpop/[slug]                # K-Pop 상세 (아티스트 프로필)
/noticias                   # 뉴스 목록
/noticias/[slug]            # 뉴스 상세
/guias                      # 가이드 목록
/guias/[slug]               # 가이드 상세
```

---

## 6. 디자인 시스템

### 6.1 Color Palette

```css
/* Primary: Pink/Rose (K-Culture 감성) */
--color-primary-500: #ec4899;    /* pink-500 */
--color-primary-600: #db2777;    /* pink-600 */

/* Secondary: Purple (보조색) */
--color-secondary-500: #8b5cf6;  /* purple-500 */
--color-secondary-600: #7c3aed;  /* purple-600 */

/* Neutral: Gray */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-600: #4b5563;
--color-gray-900: #111827;

/* Semantic */
--color-success: #10b981;        /* emerald-500 */
--color-warning: #f59e0b;        /* amber-500 */
--color-error: #ef4444;          /* red-500 */
```

### 6.2 Typography

```css
/* Font Family */
font-family: system-ui, -apple-system, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### 6.3 Breakpoints

```css
/* Tailwind Default */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 7. 개발 워크플로우

### 7.1 Branch Strategy

```
main (production)
  │
  ├── feat/[feature-name]   # 기능 개발
  ├── fix/[bug-name]        # 버그 수정
  ├── docs/[doc-name]       # 문서 작업
  └── refactor/[scope]      # 리팩토링
```

### 7.2 Commit Convention

```
<type>(<scope>): <subject>

Types:
  feat     새 기능
  fix      버그 수정
  docs     문서 변경
  style    포맷팅 (코드 변경 없음)
  refactor 리팩토링
  test     테스트 추가/수정
  chore    빌드/설정 변경
  content  콘텐츠 추가/수정

Examples:
  feat(dramas): add drama detail page
  fix(seo): correct canonical URL generation
  content(kpop): add BTS group profile
```

### 7.3 Development Commands

```bash
# 개발 서버 시작
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview

# TypeScript 체크
pnpm check
```

---

## 8. 배포 파이프라인

### 8.1 CI/CD Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Push   │ ──▶ │  Build  │ ──▶ │  Test   │ ──▶ │ Deploy  │
│ to main │     │  Check  │     │  (opt)  │     │  (CF)   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### 8.2 Cloudflare Pages 설정

| 항목 | 값 |
|------|-----|
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node.js version | 18+ |
| Environment variables | (없음, 정적 사이트) |

---

## 9. 콘텐츠 작성 가이드

### 9.1 새 콘텐츠 추가

```bash
# K-Drama 추가
src/content/dramas/[slug].mdx

# K-Pop 추가
src/content/kpop/[slug].mdx

# 뉴스 추가
src/content/noticias/[slug].mdx

# 가이드 추가
src/content/guias/[slug].mdx
```

### 9.2 Frontmatter 템플릿

```yaml
# K-Drama 예시
---
title: "Reina de las Lágrimas: El Drama del Año 2024"
description: "Reseña completa de Queen of Tears..."
pubDate: 2024-03-15
heroImage: "/images/dramas/queen-of-tears.jpg"
heroImageAlt: "Póster de Queen of Tears"
author: "HallyuLatino"
tags: ["romance", "comedia", "2024"]
dramaTitle: "눈물의 여왕"
dramaYear: 2024
network: "tvN"
episodes: 16
genre: ["Romance", "Comedia"]
cast: ["Kim Soo-hyun", "Kim Ji-won"]
whereToWatch: ["Netflix"]
---
```

### 9.3 SEO 체크리스트

- [ ] title: 60자 이내, 키워드 포함
- [ ] description: 160자 이내, 행동 유도
- [ ] heroImage: WebP 형식, 1200x630px 권장
- [ ] heroImageAlt: 이미지 설명 필수
- [ ] tags: 3-5개 관련 태그

---

## 10. 로드맵

### Phase 1: Foundation (현재)

- [x] Astro SSG 프로젝트 설정
- [x] Tailwind CSS 통합
- [x] Content Collections 구조
- [x] SEO 컴포넌트 (meta, JSON-LD)
- [x] 기본 레이아웃 및 페이지
- [ ] 샘플 콘텐츠 10개 이상

### Phase 2: Content & SEO (1-3개월)

- [ ] 콘텐츠 50개 이상 작성
- [ ] Google Analytics 연동
- [ ] Google Search Console 등록
- [ ] Image optimization (Cloudflare Images)
- [ ] 검색 기능 추가

### Phase 3: Growth (3-6개월)

- [ ] Google AdSense 연동
- [ ] 소셜 미디어 공유 최적화
- [ ] 뉴스레터 구독 기능
- [ ] 관련 콘텐츠 추천

### Phase 4: Monetization (6-12개월)

- [ ] Mediavine 전환 (50,000 세션 달성 시)
- [ ] 프리미엄 콘텐츠 검토
- [ ] 스폰서십 파트너십

---

## 11. 참고 문서

| 문서 | 설명 | 위치 |
|------|------|------|
| README.md | 빠른 시작 가이드 | `/README.md` |
| plan.md | TDD 개발 플랜 | `/plan.md` |
| Content Schema | 콘텐츠 스키마 정의 | `/src/content/config.ts` |

---

## 12. 용어집 (Glossary)

| 용어 | 정의 |
|------|------|
| **K-Drama** | 한국 드라마 (Korean Drama) |
| **K-Pop** | 한국 대중음악 (Korean Pop) |
| **Hallyu** | 한류, 한국 문화 콘텐츠의 전 세계적 인기 현상 |
| **SSG** | Static Site Generation, 정적 사이트 생성 |
| **MDX** | Markdown + JSX, 마크다운에 컴포넌트 삽입 가능 |
| **Content Collections** | Astro의 타입 안전 콘텐츠 관리 시스템 |
| **Core Web Vitals** | Google의 웹 성능 핵심 지표 (LCP, CLS, INP) |

---

## 13. 연락처 & 지원

| 역할 | 담당 |
|------|------|
| Project Owner | @hallyulatino-team |
| Technical Lead | @hallyulatino-team |
| Content Lead | @hallyulatino-team |

**Repository**: https://github.com/Prometheus-P/hallyulatino

---

*이 문서는 프로젝트의 Single Source of Truth입니다. 모든 중요한 결정과 변경 사항은 이 문서에 반영되어야 합니다.*
