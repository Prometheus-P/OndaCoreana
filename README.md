# 🎬 HallyuLatino

> 라틴 아메리카를 위한 AI 기반 한류 콘텐츠 플랫폼

[![CI](https://github.com/hallyulatino/hallyulatino/workflows/CI/badge.svg)](https://github.com/hallyulatino/hallyulatino/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 📖 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

---

## 🌟 소개

**HallyuLatino**는 라틴 아메리카 한류 팬들을 위한 올인원 플랫폼입니다.

AI 기반 실시간 번역과 자막 서비스로 언어 장벽 없이 K-Drama, K-Pop, K-Beauty 콘텐츠를 즐기고, 팬 커뮤니티에서 소통할 수 있습니다.

### 왜 HallyuLatino인가?

```
🌐 언어 장벽 해소  →  AI 실시간 번역 (한국어 ↔ 스페인어/포르투갈어)
🎬 큐레이션      →  라틴 취향 맞춤형 K-콘텐츠 추천
👥 커뮤니티      →  팬 소통, 이벤트, 굿즈 마켓플레이스
🤖 AI 어시스턴트  →  한류 정보 챗봇, 한국어 학습 도우미
```

---

## ✨ 주요 기능

### MVP (Phase 1)

| 기능 | 설명 |
|------|------|
| 🔐 사용자 인증 | 이메일/소셜 로그인 (Google, Facebook) |
| 🎬 콘텐츠 스트리밍 | K-Drama, K-Pop MV 고화질 스트리밍 |
| 📝 AI 자막 | 실시간 한→스페인어/포르투갈어 번역 자막 |
| 🔍 콘텐츠 검색 | 제목, 배우, 장르별 검색 |
| 👤 사용자 프로필 | 시청 기록, 즐겨찾기 관리 |
| 🎯 추천 시스템 | AI 기반 개인화 콘텐츠 추천 |

### 향후 기능 (Phase 2-3)

- 👥 팬 커뮤니티 (게시판, 채팅)
- 🤖 AI 챗봇 (한류 정보 Q&A)
- 🎙️ AI 더빙 (스페인어/포르투갈어)
- 📚 한국어 학습 (드라마 기반)
- 🛍️ 굿즈 마켓플레이스

---

## 🛠 기술 스택

### Frontend
```
Next.js 14  •  TypeScript 5  •  Tailwind CSS 3  •  Zustand  •  React Query
```

### Backend
```
Python 3.12  •  FastAPI  •  SQLAlchemy 2  •  Celery  •  Redis
```

### Database
```
PostgreSQL 16  •  Redis 7  •  Elasticsearch 8  •  Pinecone
```

### AI/ML
```
OpenAI GPT-4  •  Whisper  •  LangChain  •  ElevenLabs
```

### Infrastructure
```
AWS  •  Kubernetes (EKS)  •  Terraform  •  GitHub Actions
```

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js** 20.x 이상
- **Python** 3.12 이상
- **Docker** 및 **Docker Compose**
- **Git**

### 1단계: 저장소 클론

```bash
git clone https://github.com/hallyulatino/hallyulatino.git
cd hallyulatino
```

### 2단계: 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 필요한 값을 설정하세요
```

### 3단계: Docker로 개발 환경 실행

```bash
# 전체 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4단계: 개별 서비스 실행 (선택사항)

**프론트엔드:**
```bash
cd src/frontend
npm install
npm run dev
# http://localhost:3000 에서 확인
```

**백엔드:**
```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000/docs 에서 API 문서 확인
```

### 5단계: 테스트 실행

```bash
# 전체 테스트
make test

# 단위 테스트만
make test-unit

# 통합 테스트만
make test-integration
```

---

## 프로젝트 구조

```
hallyulatino/
├── CONTEXT.md              # 프로젝트 Single Source of Truth
├── README.md               # 이 파일
├── ENVIRONMENT.md          # 환경 설정 상세 가이드
├── CONTRIBUTING.md         # 기여 가이드
├── Makefile                # 빌드/테스트 명령어
├── docker-compose.yml      # Docker 개발 환경
│
├── docs/                   # 문서
│   ├── INDEX.md            # 문서 네비게이션 허브
│   ├── plan.md             # TDD 개발 계획
│   ├── specs/              # 기술 스펙 (PRD, 아키텍처, API, ADRs)
│   ├── guides/             # 개발 가이드 (TDD, 코드리뷰, 버저닝)
│   ├── business/           # 비즈니스 문서
│   └── operations/         # 운영 문서 (배포 체크리스트)
│
├── src/                    # 소스 코드
│   ├── frontend/           # Next.js 프론트엔드
│   │   ├── app/            # App Router (페이지)
│   │   ├── components/     # React 컴포넌트
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # API 서비스
│   │   └── store/          # 상태 관리
│   │
│   └── backend/            # FastAPI 백엔드
│       ├── app/            # 애플리케이션 코드
│       │   ├── domain/     # 도메인 레이어 (엔티티, VO)
│       │   ├── application/# 애플리케이션 레이어 (Use Cases)
│       │   ├── infrastructure/ # 인프라 레이어 (DB, 외부 서비스)
│       │   └── presentation/   # 프레젠테이션 레이어 (API)
│       ├── tests/          # 백엔드 테스트
│       │   ├── unit/       # 단위 테스트
│       │   └── integration/# 통합 테스트
│       └── alembic/        # DB 마이그레이션
│
├── n8n/                    # n8n 워크플로우
├── scripts/                # 유틸리티 스크립트
└── .github/                # GitHub Actions, 이슈 템플릿
```

---

## 📚 개발 가이드

### 핵심 문서

| 문서 | 설명 |
|------|------|
| [CONTEXT.md](./CONTEXT.md) | 프로젝트 전체 컨텍스트 |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | 개발 환경 설정 상세 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 기여 가이드라인 |
| [docs/INDEX.md](./docs/INDEX.md) | 문서 네비게이션 허브 |
| [docs/specs/PRD.md](./docs/specs/PRD.md) | 제품 요구사항 |
| [docs/specs/ARCHITECTURE.md](./docs/specs/ARCHITECTURE.md) | 시스템 아키텍처 |
| [docs/specs/API_SPEC.md](./docs/specs/API_SPEC.md) | API 명세 |
| [docs/guides/TDD_GUIDE.md](./docs/guides/TDD_GUIDE.md) | TDD 가이드 |
| [docs/guides/CODE_REVIEW_GUIDE.md](./docs/guides/CODE_REVIEW_GUIDE.md) | 코드 리뷰 가이드 |

### 개발 원칙

1. **TDD (Test-Driven Development)**
   - 테스트 먼저 작성 → 구현 → 리팩토링
   - 목표 커버리지: Unit 80%, Integration 60%

2. **클린 아키텍처**
   - 계층 분리: Domain → Application → Infrastructure
   - 의존성 역전 원칙 준수

3. **API-First**
   - OpenAPI 3.0 스펙 우선 정의
   - 프론트엔드/백엔드 병렬 개발

4. **코드 품질**
   - 함수: 20줄 이하
   - 클래스: 200줄 이하
   - 네스팅: 3단계 이하

### 커밋 컨벤션

```
<type>(<scope>): <subject>

# 예시
feat(auth): add JWT refresh token
fix(api): resolve null pointer in user endpoint
docs(readme): update installation guide
```

| Type | 설명 |
|------|------|
| feat | 새로운 기능 |
| fix | 버그 수정 |
| docs | 문서 변경 |
| refactor | 리팩토링 |
| test | 테스트 추가/수정 |
| chore | 빌드/설정 변경 |

---

## 🤝 기여하기

HallyuLatino에 기여해 주셔서 감사합니다!

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해 주세요.

### 간단한 기여 방법

1. 이 저장소를 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

---

## 📞 연락처

- **이메일**: team@hallyulatino.com
- **이슈**: [GitHub Issues](https://github.com/hallyulatino/hallyulatino/issues)
- **토론**: [GitHub Discussions](https://github.com/hallyulatino/hallyulatino/discussions)

---

<p align="center">
  Made with ❤️ for Latin American K-Content Fans
</p>
