---
title: ADR-0001 기술 스택 선정
version: 1.0.0
status: Accepted
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
language: Korean (한국어)
---

# ADR-0001: 기술 스택 선정

## 상태 (Status)

**Accepted**

## 컨텍스트 (Context)

HallyuLatino 플랫폼을 구축하기 위한 기술 스택을 선정해야 합니다.

### 요구사항

- 라틴 아메리카 시장을 위한 스트리밍 플랫폼
- AI 기반 번역/자막 기능
- 확장 가능한 마이크로서비스 아키텍처
- 빠른 개발 속도와 유지보수성
- 팀의 기술 역량 고려

### 제약 조건

- 스타트업 초기 단계로 제한된 인력
- 빠른 MVP 출시 필요
- 클라우드 네이티브 환경
- AI/ML 파이프라인 필요

## 결정 (Decision)

### Frontend

| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **Next.js** | 14.x | SSR/SSG 지원, React 생태계, 뛰어난 DX |
| TypeScript | 5.x | 타입 안정성, 대규모 프로젝트 유지보수 |
| Tailwind CSS | 3.x | 빠른 스타일링, 일관된 디자인 |
| Zustand | 4.x | 간단한 상태 관리, 적은 보일러플레이트 |
| React Query | 5.x | 서버 상태 관리, 캐싱 |

### Backend

| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **Python** | 3.12.x | AI/ML 생태계, 빠른 개발 속도 |
| **FastAPI** | 0.109.x | 고성능, 자동 API 문서, 타입 힌트 |
| SQLAlchemy | 2.x | 강력한 ORM, 유연성 |
| Pydantic | 2.x | 데이터 검증, FastAPI 통합 |
| Celery | 5.x | 비동기 작업 큐, 안정성 |

### Database

| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **PostgreSQL** | 16.x | ACID, JSON 지원, 확장성 |
| **Redis** | 7.x | 캐싱, 세션, 큐 브로커 |
| Elasticsearch | 8.x | 전문 검색, 다국어 지원 |
| Pinecone | - | 벡터 검색, 관리형 서비스 |

### AI/ML

| 기술 | 선택 이유 |
|------|-----------|
| OpenAI GPT-4 | 최고 수준의 번역 품질 |
| Whisper | 음성 인식, 자막 생성 |
| LangChain | LLM 오케스트레이션 |
| ElevenLabs | AI 더빙 (Phase 3) |

### Infrastructure

| 기술 | 선택 이유 |
|------|-----------|
| **AWS** | 라틴 아메리카 리전, 종합 서비스 |
| Kubernetes (EKS) | 컨테이너 오케스트레이션, 확장성 |
| Terraform | IaC, 재현 가능한 인프라 |
| GitHub Actions | CI/CD, GitHub 통합 |

## 결과 (Consequences)

### 긍정적 결과

- Python + FastAPI로 빠른 API 개발 가능
- Next.js로 SEO 최적화 및 빠른 초기 로딩
- PostgreSQL로 관계형 데이터 안정적 관리
- AI/ML 파이프라인 구축 용이 (Python 생태계)
- Kubernetes로 마이크로서비스 확장성 확보

### 부정적 결과

- 마이크로서비스 운영 복잡성 증가
- Kubernetes 학습 곡선
- 다양한 기술 스택으로 인한 관리 포인트 증가
- 클라우드 비용 관리 필요

### 위험 요소

| 위험 | 완화 방안 |
|------|-----------|
| Python 동시성 제한 | 비동기 처리, 수평 확장 |
| K8s 복잡성 | 관리형 서비스(EKS) 사용, GitOps 도입 |
| 벤더 락인 | 추상화 레이어, 표준 기술 사용 |

## 대안 검토 (Alternatives Considered)

### Backend

| 대안 | 장점 | 단점 | 미선택 이유 |
|------|------|------|-------------|
| Node.js/Express | JS 통일, npm 생태계 | AI/ML 통합 불편, 타입 안정성 | Python AI 생태계 필요 |
| Go | 고성능, 동시성 | 학습 곡선, 생태계 | 개발 속도 우선 |
| Django | 풍부한 기능 | 무겁고, 비동기 제한 | FastAPI 성능 우위 |

### Database

| 대안 | 장점 | 단점 | 미선택 이유 |
|------|------|------|-------------|
| MongoDB | 스키마 유연성 | ACID 제한, 조인 불편 | 관계형 데이터 모델 필요 |
| MySQL | 널리 사용 | JSON 지원 부족 | PostgreSQL 기능 우위 |

### Cloud

| 대안 | 장점 | 단점 | 미선택 이유 |
|------|------|------|-------------|
| GCP | AI/ML 강점 | 라틴 아메리카 리전 제한 | AWS 리전 커버리지 |
| Azure | 엔터프라이즈 | 복잡한 가격 정책 | AWS 익숙함 |

## 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [AWS 라틴 아메리카 리전](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [Python AI/ML 생태계](https://www.python.org/about/apps/)

---

*이 결정은 프로젝트 초기 단계에서 내려졌으며, 비즈니스 요구사항 변화에 따라 재검토될 수 있습니다.*
