# n8n 워크플로우 자동화

> HallyuLatino 프로젝트의 비동기 작업 처리를 위한 n8n 워크플로우 설정

## 개요

n8n은 Celery + RabbitMQ를 대체하여 다음 작업을 처리합니다:

- **콘텐츠 파이프라인**: 영상 업로드 → 음성 인식 → 번역 → 자막 생성
- **알림 워크플로우**: 신규 콘텐츠 → 구독자 이메일/푸시 발송
- **소셜 미디어**: 신규 콘텐츠 → Twitter/Instagram 자동 포스팅
- **AI 통합**: DeepL, Whisper, OpenAI 연동

## 로컬 개발 환경

### 시작하기

```bash
# Docker Compose로 n8n 시작
docker-compose up -d n8n

# n8n UI 접속
open http://localhost:5678
```

### 기본 인증 정보

| 항목 | 값 |
|------|-----|
| URL | http://localhost:5678 |
| 사용자명 | admin |
| 비밀번호 | admin |

## 워크플로우 목록

### 1. 콘텐츠 자막 생성 파이프라인

**파일**: `workflows/content-subtitle-pipeline.json`

```
[Webhook] → [Whisper] → [DeepL ES] → [VTT 생성] → [Supabase]
                     → [DeepL PT] ↗
```

**트리거**: POST `/webhook/content-upload`

```json
{
  "content_id": "uuid",
  "audio_url": "https://storage.example.com/audio.mp3"
}
```

### 2. 신규 콘텐츠 알림

**파일**: `workflows/new-content-notification.json`

```
[Webhook] → [구독자 조회] → [배치 분할] → [이메일 발송] → [알림 로그]
```

**트리거**: POST `/webhook/new-content`

```json
{
  "content_id": "uuid",
  "title": "콘텐츠 제목",
  "content_type": "k-drama",
  "description": "콘텐츠 설명"
}
```

## 워크플로우 가져오기

1. n8n UI 접속 (http://localhost:5678)
2. 좌측 메뉴 → Workflows → Import from File
3. `workflows/` 폴더의 JSON 파일 선택
4. Credentials 설정 (아래 참조)

## Credentials 설정

n8n UI에서 Settings → Credentials에서 다음 인증 정보를 설정하세요:

### 1. Replicate API (Whisper)

- **Type**: Header Auth
- **Name**: `Authorization`
- **Value**: `Token ${REPLICATE_API_TOKEN}`

### 2. DeepL API

- **Type**: DeepL
- **API Key**: DeepL API 키

### 3. Supabase API

- **Type**: Supabase
- **Host**: Supabase 프로젝트 URL
- **Service Role Key**: Supabase 서비스 키

### 4. SMTP (이메일)

개발 환경에서는 Mailhog 사용:

- **Host**: mailhog
- **Port**: 1025
- **SSL/TLS**: false

## 프로덕션 배포

### Railway 배포

```bash
# Railway CLI로 n8n 배포
railway init
railway add --database postgres
railway up
```

### 환경 변수 (Railway)

```
N8N_HOST=your-app.railway.app
N8N_PROTOCOL=https
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=<secure-user>
N8N_BASIC_AUTH_PASSWORD=<secure-password>
WEBHOOK_URL=https://your-app.railway.app/
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{PGHOST}}
DB_POSTGRESDB_PORT=${{PGPORT}}
DB_POSTGRESDB_DATABASE=${{PGDATABASE}}
DB_POSTGRESDB_USER=${{PGUSER}}
DB_POSTGRESDB_PASSWORD=${{PGPASSWORD}}
```

### n8n Cloud (대안)

월 $20부터 관리형 n8n 서비스 사용 가능:
https://n8n.io/cloud/

## 백엔드 연동

### FastAPI에서 n8n 웹훅 호출

```python
# src/backend/shared/n8n_client.py
import httpx
from config import settings

class N8nClient:
    def __init__(self):
        self.base_url = settings.N8N_WEBHOOK_URL

    async def trigger_subtitle_pipeline(
        self,
        content_id: str,
        audio_url: str
    ) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/content-upload",
                json={
                    "content_id": content_id,
                    "audio_url": audio_url
                }
            )
            return response.json()

    async def trigger_new_content_notification(
        self,
        content_id: str,
        title: str,
        content_type: str,
        description: str
    ) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/new-content",
                json={
                    "content_id": content_id,
                    "title": title,
                    "content_type": content_type,
                    "description": description
                }
            )
            return response.json()

# 사용 예시
n8n = N8nClient()
await n8n.trigger_subtitle_pipeline(
    content_id="123",
    audio_url="https://storage.example.com/audio.mp3"
)
```

## 모니터링

### 실행 기록

n8n UI → Executions에서 모든 워크플로우 실행 기록 확인 가능

### 에러 알림

워크플로우에 Error Trigger 노드 추가하여 Slack/Discord 알림 설정 가능

## 비용

| 환경 | 비용/월 |
|------|---------|
| 셀프호스팅 (Railway Starter) | ~$5-10 |
| n8n Cloud (Starter) | $20 |
| n8n Cloud (Pro) | $50 |

---

*참고: [n8n 공식 문서](https://docs.n8n.io/)*
