---
title: HallyuLatino - Environment Setup Guide
version: 1.0.0
status: Approved
owner: @hallyulatino-team
created: 2024-11-28
updated: 2024-11-28
reviewers: []
---

# ENVIRONMENT.md - 환경 설정 가이드

> **이 문서는 개발 환경 설정에 필요한 모든 정보를 제공합니다.**
> 새 개발자 온보딩 및 CI/CD 환경 구성 시 참조하세요.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2024-11-28 | @claude | 최초 작성 |

---

## 1. 시스템 요구사항

### 1.1 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 권장 버전 | 설치 확인 |
|-----------|----------|----------|----------|
| Node.js | 18.0.0 | 20.x LTS | `node --version` |
| pnpm | 8.0.0 | 9.x | `pnpm --version` |
| Git | 2.30.0 | latest | `git --version` |

### 1.2 권장 에디터

| 에디터 | 필수 확장 |
|--------|----------|
| **VS Code** (권장) | Astro, Tailwind CSS IntelliSense, ESLint, Prettier |
| WebStorm | Astro plugin |
| Neovim | astro-ls |

### 1.3 운영체제

| OS | 지원 상태 |
|----|----------|
| macOS 12+ | ✅ 완전 지원 |
| Ubuntu 20.04+ | ✅ 완전 지원 |
| Windows 11 + WSL2 | ✅ 완전 지원 |
| Windows (native) | ⚠️ 제한적 지원 |

---

## 2. 로컬 개발 환경 설정

### 2.1 Node.js 설치

**macOS (Homebrew):**
```bash
# Node.js 20 LTS 설치
brew install node@20

# 또는 nvm 사용 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

**Ubuntu/Debian:**
```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows (WSL2):**
```bash
# WSL2 Ubuntu에서 위의 Ubuntu 명령어 사용
```

### 2.2 pnpm 설치

```bash
# npm으로 설치
npm install -g pnpm

# 또는 corepack으로 활성화 (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# 설치 확인
pnpm --version
```

### 2.3 프로젝트 클론 및 설정

```bash
# 1. 저장소 클론
git clone https://github.com/Prometheus-P/hallyulatino.git
cd hallyulatino

# 2. 의존성 설치
pnpm install

# 3. 개발 서버 시작
pnpm dev

# 4. 브라우저에서 확인
# http://localhost:4321
```

### 2.4 설치 확인

```bash
# 빌드 테스트
pnpm build

# 성공 시 출력:
# ✓ Completed in XXms.
# [build] X page(s) built in X.XXs
# [build] Complete!
```

---

## 3. VS Code 설정

### 3.1 필수 확장

`.vscode/extensions.json`에 정의된 확장:

```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

**설치 방법:**
```bash
# VS Code에서 프로젝트 열기
code .

# 확장 탭에서 "@recommended" 검색 후 모두 설치
```

### 3.2 권장 설정

`.vscode/settings.json` (프로젝트 레벨):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "tailwindCSS.includeLanguages": {
    "astro": "html"
  },
  "files.associations": {
    "*.mdx": "markdown"
  }
}
```

### 3.3 디버깅 설정

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Astro Dev Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 4. 환경 변수

### 4.1 현재 상태

**이 프로젝트는 100% 정적 사이트로, 빌드 시 환경 변수가 필요하지 않습니다.**

모든 설정은 `astro.config.mjs`에 하드코딩되어 있습니다.

### 4.2 향후 환경 변수 (예정)

향후 기능 추가 시 필요할 수 있는 환경 변수:

```bash
# .env.example (향후 생성 예정)

# Analytics (Phase 2)
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Search (Phase 3)
PUBLIC_ALGOLIA_APP_ID=
PUBLIC_ALGOLIA_SEARCH_KEY=

# Newsletter (Phase 3)
PUBLIC_BUTTONDOWN_API_KEY=
```

### 4.3 환경 변수 규칙

| 접두사 | 용도 | 클라이언트 노출 |
|--------|------|----------------|
| `PUBLIC_` | 클라이언트 사이드 | ✅ 노출됨 |
| (없음) | 서버 사이드 only | ❌ 노출 안됨 |

---

## 5. 프로젝트 설정 파일

### 5.1 astro.config.mjs

```javascript
// 핵심 설정
export default defineConfig({
  site: 'https://hallyulatino.com',  // 프로덕션 URL
  output: 'static',                   // SSG 모드
  trailingSlash: 'never',             // URL 끝에 슬래시 없음

  // i18n
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'pt'],
  },

  // 통합
  integrations: [
    mdx(),
    sitemap({ i18n: { ... } }),
  ],

  // 빌드 최적화
  build: {
    format: 'file',          // /page.html (not /page/index.html)
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
```

### 5.2 tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@content/*": ["src/content/*"]
    }
  }
}
```

### 5.3 package.json 스크립트

```json
{
  "scripts": {
    "dev": "astro dev",           // 개발 서버 (HMR)
    "build": "astro build",       // 프로덕션 빌드
    "preview": "astro preview",   // 빌드 미리보기
    "check": "astro check"        // TypeScript 검사
  }
}
```

---

## 6. 디렉토리별 설정

### 6.1 Content Collections

`src/content/config.ts`에서 스키마 정의:

```typescript
// 콘텐츠 타입 추가 시:
// 1. config.ts에 새 collection 정의
// 2. src/content/[collection-name]/ 디렉토리 생성
// 3. src/pages/[collection-name]/ 페이지 생성
```

### 6.2 Static Assets

```
public/
├── favicon.svg          # 파비콘 (SVG)
├── robots.txt           # 크롤러 설정
├── og-default.jpg       # 기본 OG 이미지 (1200x630)
└── images/
    ├── dramas/          # 드라마 이미지
    ├── kpop/            # K-Pop 이미지
    ├── noticias/        # 뉴스 이미지
    └── guias/           # 가이드 이미지
```

**이미지 권장 사항:**
| 용도 | 크기 | 형식 |
|------|------|------|
| Hero Image | 1200x630px | WebP, JPG |
| Thumbnail | 400x300px | WebP |
| OG Image | 1200x630px | JPG |

---

## 7. Git 설정

### 7.1 .gitignore

```gitignore
# 빌드 출력
dist/

# Astro 생성 파일
.astro/

# 의존성
node_modules/

# 환경 변수
.env
.env.*
!.env.example

# OS 파일
.DS_Store

# IDE
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/launch.json
```

### 7.2 Branch 보호 규칙 (GitHub)

| Branch | 규칙 |
|--------|------|
| `main` | PR 필수, 1+ 리뷰 승인, CI 통과 필수 |
| `feat/*` | 제한 없음 |

---

## 8. CI/CD 환경

### 8.1 GitHub Actions

`.github/workflows/ci.yml` (예정):

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm check
      - run: pnpm build
```

### 8.2 Cloudflare Pages

| 설정 | 값 |
|------|-----|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output | `dist` |
| Node.js version | 20 |
| Root directory | `/` |

---

## 9. 문제 해결

### 9.1 일반적인 문제

**문제: `pnpm install` 실패**
```bash
# 해결: 캐시 정리 후 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**문제: TypeScript 타입 오류**
```bash
# 해결: Astro 타입 동기화
pnpm astro sync
```

**문제: 빌드 시 이미지 오류**
```bash
# 해결: public/images 디렉토리 확인
ls -la public/images/

# 이미지 경로는 /images/... 로 시작해야 함
```

### 9.2 포트 충돌

```bash
# 기본 포트(4321) 변경
pnpm dev --port 3000

# 또는 astro.config.mjs에서 설정
export default defineConfig({
  server: { port: 3000 }
});
```

### 9.3 Hot Reload 안 됨

```bash
# 1. 서버 재시작
# 2. 브라우저 캐시 삭제
# 3. 파일 시스템 감시 제한 확인 (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 10. 성능 최적화 설정

### 10.1 빌드 최적화

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',  // 작은 CSS 인라인
  },
  compressHTML: true,           // HTML 압축
  vite: {
    build: {
      cssMinify: true,          // CSS 압축
    },
  },
});
```

### 10.2 이미지 최적화 (향후)

```bash
# Astro Image 통합 추가 (선택사항)
pnpm astro add image
```

---

## 11. 보안 설정

### 11.1 의존성 보안

```bash
# 취약점 검사
pnpm audit

# 취약점 수정
pnpm audit fix
```

### 11.2 시크릿 관리

- **로컬**: `.env` 파일 (gitignore됨)
- **CI/CD**: GitHub Secrets / Cloudflare 환경 변수
- **절대 금지**: 시크릿을 코드에 하드코딩

---

## 12. 관련 문서

| 문서 | 설명 |
|------|------|
| [CONTEXT.md](./CONTEXT.md) | 프로젝트 전체 컨텍스트 |
| [README.md](./README.md) | 빠른 시작 가이드 |
| [plan.md](./plan.md) | TDD 개발 플랜 |

---

*환경 설정 관련 문의: 프로젝트 Issue 등록*
