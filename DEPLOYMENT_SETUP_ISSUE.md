# 🚀 배포 환경 설정 체크리스트

## 📋 개요

HallyuLatino 프로젝트의 프로덕션 배포를 위해 필요한 설정 및 구성 항목들을 정리합니다.

**현재 상태:** 배포 준비도 70% ✅
**목표 플랫폼:** Cloudflare Pages (메인), Vercel/Netlify (옵션)
**프로젝트 타입:** Astro 5.x 정적 사이트 (SSG)

---

## 🔴 우선순위 1: 필수 항목

### 1. GitHub Actions CI/CD 워크플로우 수정

**현재 문제:**
- 기존 `ci.yml`이 백엔드(Python/PostgreSQL) + 프론트엔드(React) 모노레포 구조로 설정되어 있음
- 현재 프로젝트는 단일 Astro SSG 애플리케이션

**필요한 작업:**
- [ ] `.github/workflows/ci.yml` 수정하여 Astro 프로젝트에 맞게 최적화
- [ ] 워크플로우에 포함할 단계:
  - `pnpm install` - 의존성 설치
  - `pnpm check` - TypeScript 타입 체크
  - `pnpm test:content` - 콘텐츠 유효성 검사
  - `pnpm test:seo` - SEO 검증
  - `pnpm build` - 프로덕션 빌드
  - `pnpm test:e2e` - Playwright E2E 테스트

**참고:**
- 현재 파일 위치: `.github/workflows/ci.yml`
- Node.js 버전: 20.x LTS 사용 권장

---

### 2. 환경 변수 템플릿 파일 추가

**필요한 작업:**
- [ ] `.env.example` 파일 생성
- [ ] 향후 사용할 환경 변수 템플릿 포함:
  ```bash
  # Phase 2: Analytics
  PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

  # Phase 3: Search (Algolia)
  PUBLIC_ALGOLIA_APP_ID=
  PUBLIC_ALGOLIA_SEARCH_KEY=

  # Phase 3: Newsletter (ButtonDown)
  PUBLIC_BUTTONDOWN_API_KEY=
  ```

**현재 상태:**
- ✅ `.gitignore`에 `.env` 파일 제외 설정 완료
- ✅ 현재는 환경 변수 불필요 (100% 정적 사이트)

---

### 3. 배포 플랫폼별 설정 파일 추가

#### 3-1. Vercel 설정 (옵션)

- [ ] `vercel.json` 파일 생성
  ```json
  {
    "buildCommand": "pnpm build",
    "outputDirectory": "dist",
    "framework": "astro",
    "installCommand": "pnpm install"
  }
  ```

#### 3-2. Netlify 설정 (옵션)

- [ ] `netlify.toml` 파일 생성
  ```toml
  [build]
    command = "pnpm build"
    publish = "dist"

  [build.environment]
    NODE_VERSION = "20"

  [[redirects]]
    from = "/*"
    to = "/404"
    status = 404
  ```

#### 3-3. Cloudflare Pages 설정 확인

**현재 상태:** 문서화 완료 ✅

**Cloudflare Pages 대시보드 설정값:**
```
Framework preset:    Astro
Build Command:       pnpm build
Build Output:        dist
Root Directory:      /
Node.js Version:     20
```

- [ ] Cloudflare Pages 프로젝트 생성 여부 확인
- [ ] 커스텀 도메인 `hallyulatino.com` 연결 확인
- [ ] Production 브랜치 설정 확인

---

## 🟡 우선순위 2: 권장 항목

### 4. Docker 컨테이너화 (선택사항)

**용도:**
- 로컬 개발 환경 일관성 확보
- 자체 호스팅 옵션 제공
- CI/CD 파이프라인 격리

**필요한 작업:**

#### 4-1. Dockerfile 추가

- [ ] `Dockerfile` 생성
  ```dockerfile
  FROM node:20-alpine AS build

  WORKDIR /app

  # pnpm 설치
  RUN npm install -g pnpm

  # 의존성 설치
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile

  # 빌드
  COPY . .
  RUN pnpm build

  # 프로덕션 이미지
  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

#### 4-2. Docker Compose 추가

- [ ] `docker-compose.yml` 생성
  ```yaml
  version: '3.8'

  services:
    hallyulatino:
      build: .
      ports:
        - "3000:80"
      volumes:
        - ./src:/app/src
        - ./public:/app/public
      environment:
        - NODE_ENV=production
  ```

#### 4-3. .dockerignore 추가

- [ ] `.dockerignore` 파일 생성
  ```
  node_modules
  dist
  .git
  .env
  .env.local
  .astro
  *.log
  ```

---

### 5. Pre-commit Hooks 설정

**목적:** 코드 품질 자동 검증

**필요한 작업:**
- [ ] Husky 설치 및 설정
  ```bash
  pnpm add -D husky lint-staged
  ```
- [ ] `.husky/pre-commit` 훅 생성
  ```bash
  #!/bin/sh
  pnpm check
  pnpm test:content
  ```
- [ ] `package.json`에 lint-staged 설정 추가

---

### 6. 보안 스캔 강화

**현재 상태:** CI에 기본 보안 스캔 포함 ✅

**추가 가능한 항목:**
- [ ] Dependabot 설정 (`.github/dependabot.yml`)
- [ ] Snyk 보안 스캔 통합
- [ ] OWASP Dependency Check

---

## 🔵 우선순위 3: 향후 고려사항

### 7. Google Analytics 통합 준비 (Phase 2)

**필요한 작업:**
- [ ] Google Analytics 4 계정 생성
- [ ] Measurement ID 발급
- [ ] Astro 통합 라이브러리 설치
  ```bash
  pnpm add @astrojs/analytics
  ```
- [ ] `astro.config.mjs`에 설정 추가

---

### 8. Algolia 검색 설정 준비 (Phase 3)

**필요한 작업:**
- [ ] Algolia 계정 생성
- [ ] App ID 및 Search API Key 발급
- [ ] Astro 통합 또는 커스텀 검색 컴포넌트 구현

---

### 9. 모니터링 및 관찰성 (Observability)

**옵션:**
- [ ] Sentry 에러 추적 설정
- [ ] LogRocket 사용자 세션 기록
- [ ] Cloudflare Web Analytics 활성화 (무료)

---

### 10. CDN 및 성능 최적화

**체크리스트:**
- [ ] 이미지 최적화 (WebP, AVIF 변환)
- [ ] 캐시 헤더 설정 검토
- [ ] Brotli/Gzip 압축 활성화 확인
- [ ] Critical CSS 인라인화
- [ ] Font 최적화 (font-display: swap)

---

## 📊 현재 배포 준비 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 프레임워크 설정 | ✅ 완료 | Astro 5.x 완전 구성 |
| 빌드 시스템 | ✅ 완료 | pnpm, TypeScript, Tailwind |
| 콘텐츠 시스템 | ✅ 완료 | MDX + 스키마 검증 |
| 테스트 인프라 | ✅ 완료 | E2E (58개) + 검증 테스트 |
| SEO 설정 | ✅ 완료 | Meta, Sitemap, JSON-LD |
| 호스팅 설정 | ⚠️ 부분 완료 | 문서화 완료, 설정 파일 누락 |
| CI/CD 파이프라인 | 🔴 수정 필요 | 아키텍처 불일치 |
| 환경 변수 관리 | ✅ 완료 | 현재 불필요 (정적) |
| Docker 지원 | ❌ 미구현 | 선택사항 |
| 문서화 | ✅ 우수 | CONTEXT.md, README.md 완비 |

**전체 준비도: 70%** ✅

---

## 🎯 배포 전 최종 체크리스트

배포하기 전에 다음 항목들을 확인하세요:

### 코드 품질
- [ ] `pnpm check` 통과 (TypeScript 타입 에러 없음)
- [ ] `pnpm test` 모든 테스트 통과
- [ ] `pnpm build` 빌드 성공
- [ ] `pnpm test:e2e` E2E 테스트 통과

### SEO 및 메타데이터
- [ ] `robots.txt` 올바르게 설정
- [ ] Sitemap 생성 확인
- [ ] OG 이미지 모든 페이지에 존재
- [ ] Meta description 적절히 설정
- [ ] JSON-LD 구조화 데이터 검증

### 성능
- [ ] Lighthouse 점수 90+ (Performance, SEO, Accessibility)
- [ ] Core Web Vitals 통과
- [ ] 이미지 최적화 완료

### 보안
- [ ] 민감 정보 하드코딩 제거
- [ ] `.env` 파일 git에 커밋되지 않음 확인
- [ ] 의존성 취약점 스캔 통과

### 도메인 및 DNS
- [ ] 커스텀 도메인 설정 (`hallyulatino.com`)
- [ ] SSL/TLS 인증서 발급 확인
- [ ] DNS 레코드 올바르게 설정
- [ ] www 리디렉션 설정 (선택)

---

## 📚 참고 문서

- **프로젝트 개요:** `README.md`
- **개발 컨텍스트:** `CONTEXT.md`
- **환경 설정:** `ENVIRONMENT.md`
- **개발 로드맵:** `plan.md`
- **변경 이력:** `CHANGELOG.md`

---

## 🔗 관련 리소스

- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

---

**작성일:** 2025-12-01
**프로젝트 버전:** v1.1.1
**브랜치:** `claude/deployment-setup-issues-01CZhNXT3X3RMZF6uW9ExF2t`
