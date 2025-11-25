---
title: ADR-0002 기술 스택 최적화 (MVP)
version: 1.0.0
status: Accepted
supersedes: ADR-0001
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
language: Korean (한국어)
---

# ADR-0002: 기술 스택 최적화 (MVP)

## 상태 (Status)

**Accepted**

## 컨텍스트 (Context)

ADR-0001에서 선정한 기술 스택을 검토한 결과, MVP 단계에 적합하지 않은 과도한 엔지니어링이 발견되었습니다.

### 문제점

| 문제 | 이전 스택 | 영향 |
|------|-----------|------|
| 과도한 인프라 비용 | AWS EKS, Elasticsearch, Pinecone | ~$750/월 |
| 불필요한 복잡성 | 7개 마이크로서비스, Kong, RabbitMQ | 1-2인 팀에 부담 |
| 높은 AI 비용 | GPT-4 번역 | ~$60/월 (1M 문자) |
| 운영 오버헤드 | Kubernetes 관리 | 전담 DevOps 필요 |

### 요구사항 재정의

- **MVP 우선**: 6개월 내 런칭
- **비용 효율**: 월 $200 이하
- **개발 속도**: 1-2인 팀으로 개발 가능
- **확장 가능성**: 추후 스케일업 경로 확보

## 결정 (Decision)

### 아키텍처 변경

| 항목 | 이전 | 변경 후 |
|------|------|---------|
| **구조** | 마이크로서비스 (7개) | 모듈형 모놀리스 |
| **배포** | Kubernetes (EKS) | Railway (PaaS) |
| **비동기 처리** | Celery + RabbitMQ | n8n (워크플로우) |

### 인프라 변경

| 컴포넌트 | 이전 | 변경 후 | 월 비용 |
|----------|------|---------|---------|
| Frontend 호스팅 | AWS CloudFront + S3 | Vercel | $0~20 |
| Backend 호스팅 | AWS EKS | Railway | $20~50 |
| Database | AWS RDS PostgreSQL | Supabase | $0~25 |
| Cache | AWS ElastiCache | Upstash Redis | $0~10 |
| 벡터 DB | Pinecone | pgvector (확장) | $0 |
| 검색 | Elasticsearch | PostgreSQL FTS | $0 |
| 오브젝트 스토리지 | AWS S3 | Cloudflare R2 | $0~15 |
| CDN | AWS CloudFront | Cloudflare | $0 |
| 메시지 큐 | RabbitMQ | n8n 워크플로우 | $5~20 |

### AI/번역 변경

| 컴포넌트 | 이전 | 변경 후 | 월 비용 |
|----------|------|---------|---------|
| 번역 | GPT-4 | DeepL API | $5~25 |
| 음성 인식 | OpenAI Whisper | Replicate Whisper | $10~30 |
| 챗봇 | GPT-4 | GPT-4o-mini | $10~20 |

### 결제 변경

| 컴포넌트 | 이전 | 변경 후 |
|----------|------|---------|
| 글로벌 | Stripe | Stripe |
| 라틴 아메리카 | (미지원) | **MercadoPago** (브라질, 멕시코, 아르헨티나) |
| 현금 결제 | (미지원) | **OXXO** (멕시코), **PIX** (브라질) |

### n8n 도입 이유

| 기존 (Celery) | n8n |
|---------------|-----|
| 코드 기반 워크플로우 | 시각적 워크플로우 빌더 |
| RabbitMQ 필요 | 내장 스케줄러 |
| 모니터링 별도 구축 | 내장 실행 기록 |
| 외부 서비스 연동 코드 필요 | 400+ 통합 노드 |

**적합한 용도:**
- 콘텐츠 파이프라인 (업로드 → 자막 → 번역)
- 알림 워크플로우
- 소셜 미디어 자동화
- AI 서비스 오케스트레이션

**부적합한 용도:**
- 실시간 API 처리 (FastAPI 직접 처리)
- 고성능 스트리밍 (Cloudflare 처리)

## 비용 비교

```
┌─────────────────────────────────────────────────────────────┐
│                    월간 비용 비교                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  이전 스택 (ADR-0001)                                       │
│  ├─ AWS EKS + 노드                    $300~500             │
│  ├─ RDS PostgreSQL                    $50~100              │
│  ├─ ElastiCache                       $30~50               │
│  ├─ Elasticsearch                     $100~150             │
│  ├─ Pinecone                          $70                  │
│  ├─ S3 + CloudFront                   $30~50               │
│  ├─ GPT-4 번역                        $50~100              │
│  ├─ 기타 (모니터링, 로깅)              $50~100              │
│  └─ 총합                              $680~1,120/월         │
│                                                             │
│  최적화 스택 (ADR-0002)                                     │
│  ├─ Vercel                            $0~20                │
│  ├─ Railway (Backend + n8n)           $25~60               │
│  ├─ Supabase                          $0~25                │
│  ├─ Upstash Redis                     $0~10                │
│  ├─ Cloudflare R2 + CDN               $0~15                │
│  ├─ DeepL + Whisper + GPT-4o-mini     $25~75               │
│  └─ 총합                              $50~205/월            │
│                                                             │
│  💰 절감액: 약 $600~900/월 (80~90% 절감)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 결과 (Consequences)

### 긍정적 결과

1. **비용 절감**: 월 $600~900 절감 (80~90%)
2. **개발 속도**: 단일 배포 단위로 개발/배포 단순화
3. **운영 간소화**: Kubernetes 제거, 관리형 서비스 활용
4. **번역 품질**: DeepL이 GPT-4보다 번역 전문으로 품질 우수
5. **라틴 시장**: MercadoPago로 로컬 결제 지원

### 부정적 결과

1. **확장성 제한**: 대규모 트래픽 시 마이그레이션 필요
2. **커스터마이징 제한**: PaaS 서비스 제약
3. **n8n 학습**: 새로운 도구 학습 필요

### 마이그레이션 경로

트래픽 증가 시 단계적 마이그레이션:

| 단계 | 트래픽 | 조치 |
|------|--------|------|
| Phase 1 (MVP) | ~1,000 DAU | 현재 스택 유지 |
| Phase 2 | ~10,000 DAU | Railway Pro, Supabase Pro |
| Phase 3 | ~100,000 DAU | AWS/GCP 마이그레이션 검토 |
| Phase 4 | 100,000+ DAU | Kubernetes 도입 검토 |

## 대안 검토 (Alternatives Considered)

### 호스팅 플랫폼

| 대안 | 장점 | 단점 | 미선택 이유 |
|------|------|------|-------------|
| Fly.io | 엣지 배포, 저렴 | 복잡한 설정 | Railway DX 우선 |
| Render | 간단한 배포 | 콜드 스타트 | Railway 성능 우선 |
| AWS Fargate | 서버리스 컨테이너 | 복잡한 설정, 비용 | PaaS 단순성 우선 |

### 워크플로우 자동화

| 대안 | 장점 | 단점 | 미선택 이유 |
|------|------|------|-------------|
| Temporal | 강력한 워크플로우 | 복잡한 설정, 비용 | n8n 시각적 빌더 |
| Apache Airflow | 데이터 파이프라인 | 무겁고, 과도한 기능 | n8n 경량성 |
| Celery 유지 | 기존 익숙함 | RabbitMQ 추가 비용 | n8n 통합 기능 |

### 번역 서비스

| 대안 | 장점 | 단점 | 미선택 이유 |
|------|------|------|-------------|
| Google Translate | 저렴, 다양한 언어 | 품질 낮음 | DeepL 품질 우위 |
| GPT-4 유지 | 컨텍스트 이해 | 높은 비용, 느림 | DeepL 비용 효율 |
| 자체 모델 | 커스터마이징 | 초기 비용, 시간 | MVP 속도 우선 |

## 참고 자료

- [Railway 문서](https://docs.railway.app/)
- [Supabase 문서](https://supabase.com/docs)
- [n8n 문서](https://docs.n8n.io/)
- [DeepL API](https://www.deepl.com/pro-api)
- [MercadoPago 개발자](https://www.mercadopago.com.br/developers)

---

*이 결정은 MVP 단계에 최적화되었으며, 서비스 성장에 따라 재검토될 수 있습니다.*
