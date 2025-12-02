---
title: OndaCorea - Contributing Guide
version: 1.0.0
status: Approved
owner: @OndaCorea-team
created: 2024-11-28
updated: 2024-11-28
reviewers: []
---

# CONTRIBUTING.md - 기여 가이드

> **OndaCorea 프로젝트에 기여해 주셔서 감사합니다!**
> 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2024-11-28 | @claude | 최초 작성 |

---

## 목차

1. [행동 강령](#1-행동-강령)
2. [기여 방법](#2-기여-방법)
3. [개발 환경 설정](#3-개발-환경-설정)
4. [브랜치 전략](#4-브랜치-전략)
5. [커밋 컨벤션](#5-커밋-컨벤션)
6. [Pull Request 가이드](#6-pull-request-가이드)
7. [코드 스타일](#7-코드-스타일)
8. [콘텐츠 기여](#8-콘텐츠-기여)
9. [이슈 리포팅](#9-이슈-리포팅)

---

## 1. 행동 강령

### 우리의 약속

모든 기여자는 다음을 준수해야 합니다:

- **존중**: 다른 기여자를 존중하고 건설적인 피드백을 제공합니다
- **포용**: 배경, 경험 수준에 관계없이 모든 기여를 환영합니다
- **협력**: 공동의 목표를 위해 협력합니다
- **투명성**: 결정과 변경 사항을 투명하게 공유합니다

### 금지 행위

- 차별적이거나 공격적인 언어 사용
- 개인 정보 무단 공개
- 스팸 또는 광고성 콘텐츠
- 저작권 침해 콘텐츠

---

## 2. 기여 방법

### 2.1 기여 유형

| 유형 | 설명 | 난이도 |
|------|------|--------|
| 🐛 버그 리포트 | 버그 발견 시 이슈 등록 | 쉬움 |
| 📝 문서 개선 | 오타 수정, 문서 보완 | 쉬움 |
| ✨ 콘텐츠 추가 | K-Drama, K-Pop 콘텐츠 작성 | 보통 |
| 🔧 버그 수정 | 기존 버그 수정 | 보통 |
| 🚀 기능 추가 | 새로운 기능 구현 | 어려움 |

### 2.2 기여 프로세스

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Fork    │ ──▶ │  2. Branch  │ ──▶ │  3. Code    │
│  저장소 포크  │     │  브랜치 생성  │     │  코드 작성   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Merge   │ ◀── │  5. Review  │ ◀── │  4. PR      │
│  머지 완료   │     │  코드 리뷰   │     │  PR 생성    │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 3. 개발 환경 설정

### 3.1 필수 요구사항

- Node.js 18+
- pnpm 8+
- Git 2.30+

### 3.2 초기 설정

```bash
# 1. 저장소 포크 (GitHub UI에서)

# 2. 포크한 저장소 클론
git clone https://github.com/YOUR_USERNAME/ondacorea.git
cd ondacorea

# 3. 업스트림 원격 저장소 추가
git remote add upstream https://github.com/Prometheus-P/ondacorea.git

# 4. 의존성 설치
pnpm install

# 5. 개발 서버 시작
pnpm dev
```

### 3.3 업스트림 동기화

```bash
# main 브랜치로 이동
git checkout main

# 업스트림에서 최신 변경사항 가져오기
git fetch upstream

# 로컬 main에 머지
git merge upstream/main

# 포크에 푸시
git push origin main
```

---

## 4. 브랜치 전략

### 4.1 브랜치 명명 규칙

```
<type>/<description>

예시:
feat/search-functionality
fix/seo-canonical-url
docs/update-readme
content/add-bts-profile
refactor/component-structure
```

### 4.2 브랜치 타입

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat/` | 새 기능 | `feat/dark-mode` |
| `fix/` | 버그 수정 | `fix/mobile-menu` |
| `docs/` | 문서 변경 | `docs/api-guide` |
| `content/` | 콘텐츠 추가/수정 | `content/squid-game-review` |
| `refactor/` | 코드 리팩토링 | `refactor/layout-components` |
| `style/` | 스타일 변경 | `style/button-colors` |
| `test/` | 테스트 추가 | `test/e2e-navigation` |
| `chore/` | 빌드/설정 | `chore/update-deps` |

### 4.3 브랜치 생성

```bash
# main에서 새 브랜치 생성
git checkout main
git pull upstream main
git checkout -b feat/my-new-feature
```

---

## 5. 커밋 컨벤션

### 5.1 커밋 메시지 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 5.2 Type 종류

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(search): add search bar component` |
| `fix` | 버그 수정 | `fix(seo): correct og:image URL` |
| `docs` | 문서 변경 | `docs(readme): add installation steps` |
| `style` | 포맷팅 (코드 변경 없음) | `style(components): fix indentation` |
| `refactor` | 리팩토링 | `refactor(layout): extract header component` |
| `test` | 테스트 | `test(e2e): add navigation tests` |
| `chore` | 빌드/설정 | `chore(deps): update astro to 5.17` |
| `content` | 콘텐츠 추가/수정 | `content(dramas): add Goblin review` |

### 5.3 Scope 예시

| Scope | 설명 |
|-------|------|
| `dramas` | K-Drama 관련 |
| `kpop` | K-Pop 관련 |
| `noticias` | 뉴스 관련 |
| `guias` | 가이드 관련 |
| `seo` | SEO 관련 |
| `layout` | 레이아웃 |
| `components` | 컴포넌트 |
| `deps` | 의존성 |
| `ci` | CI/CD |

### 5.4 커밋 메시지 예시

```bash
# ✅ GOOD
git commit -m "feat(dramas): add filtering by genre"
git commit -m "fix(seo): resolve duplicate canonical URLs"
git commit -m "content(kpop): add BTS group profile"
git commit -m "docs(readme): update deployment instructions"

# ❌ BAD
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "WIP"
```

### 5.5 커밋 원칙

1. **원자적 커밋**: 하나의 커밋 = 하나의 논리적 변경
2. **빌드 가능**: 각 커밋은 빌드가 성공해야 함
3. **명확한 메시지**: 무엇을, 왜 변경했는지 명확히

```bash
# ✅ 분리된 커밋 (권장)
git commit -m "refactor(layout): extract navigation to separate component"
git commit -m "feat(layout): add mobile menu toggle"

# ❌ 혼합된 커밋 (비권장)
git commit -m "refactor and add mobile menu"
```

---

## 6. Pull Request 가이드

### 6.1 PR 생성 전 체크리스트

```
□ main 브랜치와 동기화됨
□ pnpm build 성공
□ pnpm check 통과 (TypeScript)
□ 새 콘텐츠의 frontmatter 유효
□ 커밋 메시지가 컨벤션 준수
□ 불필요한 파일 제거 (.DS_Store 등)
```

### 6.2 PR 템플릿

```markdown
## 변경 사항

<!-- 무엇을 변경했는지 설명 -->

- 변경 내용 1
- 변경 내용 2

## 변경 이유

<!-- 왜 이 변경이 필요한지 설명 -->

## 테스트 방법

<!-- 리뷰어가 어떻게 테스트할 수 있는지 -->

1. `pnpm dev` 실행
2. `/dramas` 페이지 확인
3. 필터 기능 테스트

## 스크린샷 (선택)

<!-- UI 변경 시 스크린샷 첨부 -->

## 체크리스트

- [ ] 빌드 성공 (`pnpm build`)
- [ ] TypeScript 체크 통과 (`pnpm check`)
- [ ] 관련 문서 업데이트
```

### 6.3 PR 작성 팁

1. **제목**: 커밋 메시지 형식과 동일하게
2. **설명**: 변경 사항, 이유, 테스트 방법 포함
3. **크기**: 가능한 작게 유지 (300줄 이하 권장)
4. **리뷰어**: 적절한 리뷰어 지정

### 6.4 PR 리뷰 응답

- 피드백에 정중하게 응답
- 변경 요청 시 수정 후 재요청
- 토론이 필요하면 코멘트로 논의

---

## 7. 코드 스타일

### 7.1 TypeScript/JavaScript

```typescript
// ✅ GOOD: 명확한 타입, 설명적인 이름
interface DramaCardProps {
  title: string;
  description: string;
  heroImage?: string;
  network: string;
}

function DramaCard({ title, description, heroImage, network }: DramaCardProps) {
  return (
    <article className="rounded-lg shadow-md">
      {heroImage && <img src={heroImage} alt={title} />}
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{network}</span>
    </article>
  );
}

// ❌ BAD: any 타입, 모호한 이름
function Card(props: any) {
  return <div>{props.t}</div>;
}
```

### 7.2 Astro 컴포넌트

```astro
---
// ✅ GOOD: Props 인터페이스 정의
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<article class="card">
  <h2>{title}</h2>
  <p>{description}</p>
</article>

<style>
  .card {
    @apply rounded-lg shadow-md p-4;
  }
</style>
```

### 7.3 CSS/Tailwind

```html
<!-- ✅ GOOD: 유틸리티 클래스 그룹화 -->
<div class="
  flex items-center justify-between
  px-4 py-2
  bg-white rounded-lg shadow
  hover:shadow-md transition-shadow
">

<!-- ❌ BAD: 정리되지 않은 클래스 -->
<div class="flex px-4 bg-white hover:shadow-md py-2 shadow rounded-lg items-center transition-shadow justify-between">
```

### 7.4 파일 명명

| 유형 | 규칙 | 예시 |
|------|------|------|
| Astro 컴포넌트 | PascalCase | `DramaCard.astro` |
| 페이지 | kebab-case | `[...slug].astro` |
| 콘텐츠 (MDX) | kebab-case | `crash-landing-on-you.mdx` |
| 유틸리티 | camelCase | `formatDate.ts` |

---

## 8. 콘텐츠 기여

### 8.1 콘텐츠 작성 가이드라인

#### 언어
- **모든 콘텐츠는 스페인어**로 작성
- 한국어 원제는 괄호 안에 표기: `Goblin (도깨비)`
- 맞춤법 검사 필수

#### SEO 최적화
- title: 60자 이내, 키워드 포함
- description: 160자 이내, 행동 유도
- tags: 3-5개 관련 태그

#### 이미지
- 형식: WebP 또는 JPG
- Hero image: 1200x630px
- alt 텍스트 필수

### 8.2 K-Drama 콘텐츠 템플릿

```mdx
---
title: "[드라마 제목] - Reseña Completa y Dónde Verlo"
description: "Descubre todo sobre [드라마]. Sinopsis, reparto, episodios y dónde ver en español."
pubDate: 2024-01-15
heroImage: "/images/dramas/[slug].jpg"
heroImageAlt: "Póster oficial de [드라마]"
author: "OndaCorea"
tags: ["romance", "comedia", "2024", "tvN"]
dramaTitle: "한국어 제목"
dramaYear: 2024
network: "tvN"
episodes: 16
genre: ["Romance", "Comedia"]
cast: ["Actor 1", "Actor 2", "Actor 3"]
whereToWatch: ["Netflix", "Viki"]
---

## Sinopsis

[간결하고 스포일러 없는 시놉시스]

## Reparto Principal

### [Actor 1] como [Character Name]
[캐릭터 설명]

### [Actor 2] como [Character Name]
[캐릭터 설명]

## Por Qué Ver Este Drama

1. **[이유 1 제목]**: [설명]
2. **[이유 2 제목]**: [설명]
3. **[이유 3 제목]**: [설명]

## Dónde Ver

- **Netflix**: Disponible con subtítulos en español
- **Viki**: Subtítulos de la comunidad

## Nuestra Opinión

[리뷰 및 평점]

**Calificación: X/10**

## Preguntas Frecuentes

### ¿Cuántos episodios tiene?
[답변]

### ¿Tiene final feliz?
[스포일러 없이 답변]
```

### 8.3 K-Pop 콘텐츠 템플릿

```mdx
---
title: "[아티스트명] - Perfil, Miembros y Discografía Completa"
description: "Todo sobre [아티스트]. Historia, miembros, álbumes y últimas noticias."
pubDate: 2024-01-15
heroImage: "/images/kpop/[slug].jpg"
heroImageAlt: "[아티스트] foto oficial"
author: "OndaCorea"
tags: ["girl group", "SM Entertainment", "4ta generación"]
artistName: "아티스트명"
artistType: "grupo"
agency: "소속사"
debutYear: 2020
members: ["Member 1", "Member 2", "Member 3"]
---

## Historia del Grupo

[그룹 역사]

## Miembros

### [Member 1]
- **Nombre real**: [본명]
- **Posición**: [포지션]
- **Fecha de nacimiento**: [생년월일]
- **Nacionalidad**: [국적]

[각 멤버 반복]

## Discografía

### Álbumes de Estudio
| Año | Álbum | Canciones |
|-----|-------|-----------|
| 2024 | Album Name | Title Track |

### Singles Destacados
- **[Song Name]** (2024) - [설명]

## Logros

- [업적 1]
- [업적 2]

## Redes Sociales

- Instagram: [@account](https://instagram.com/account)
- Twitter: [@account](https://twitter.com/account)
```

---

## 9. 이슈 리포팅

### 9.1 버그 리포트

```markdown
## 버그 설명
[버그에 대한 명확한 설명]

## 재현 방법
1. '...' 페이지로 이동
2. '...' 버튼 클릭
3. '...' 확인
4. 오류 발생

## 예상 동작
[예상되는 정상 동작]

## 실제 동작
[실제로 발생하는 동작]

## 스크린샷
[가능하면 스크린샷 첨부]

## 환경
- OS: [예: macOS 14.0]
- 브라우저: [예: Chrome 120]
- 화면 크기: [예: 1920x1080]
```

### 9.2 기능 요청

```markdown
## 기능 설명
[원하는 기능에 대한 설명]

## 사용 사례
[이 기능이 필요한 이유와 상황]

## 대안
[현재 사용 중인 대안이 있다면]

## 추가 정보
[관련 링크, 스크린샷 등]
```

---

## 10. 라이선스

이 프로젝트에 기여함으로써, 귀하의 기여가 프로젝트의 MIT 라이선스 하에 배포됨에 동의합니다.

---

## 11. 도움 받기

- **질문**: GitHub Discussions 이용
- **버그**: GitHub Issues 등록
- **긴급**: 프로젝트 메인테이너에게 직접 연락

---

## 12. 관련 문서

| 문서 | 설명 |
|------|------|
| [CONTEXT.md](./CONTEXT.md) | 프로젝트 컨텍스트 |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | 환경 설정 |
| [CODE_REVIEW_GUIDE.md](./docs/guides/CODE_REVIEW_GUIDE.md) | 코드 리뷰 가이드 |
| [VERSIONING_GUIDE.md](./docs/guides/VERSIONING_GUIDE.md) | 버전 관리 가이드 |

---

**기여해 주셔서 감사합니다! 🙏**

*OndaCorea Team*
