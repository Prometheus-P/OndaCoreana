---
title: HallyuLatino 개발 환경 설정 가이드
version: 1.0.0
status: Draft
owner: @hallyulatino-team
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# ENVIRONMENT.md - 개발 환경 설정 가이드

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @hallyulatino-team | 최초 작성 |

## 관련 문서 (Related Documents)

- [CONTEXT.md](./CONTEXT.md) - 프로젝트 컨텍스트
- [README.md](./README.md) - 빠른 시작 가이드
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드

---

## 1. 사전 요구사항 (Prerequisites)

### 1.1 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 권장 버전 | 확인 명령어 |
|------------|-----------|-----------|-------------|
| **Git** | 2.30+ | 2.43+ | `git --version` |
| **Node.js** | 18.x | 20.x LTS | `node --version` |
| **npm** | 9.x | 10.x | `npm --version` |
| **Python** | 3.11+ | 3.12.x | `python --version` |
| **Docker** | 24.x | 25.x | `docker --version` |
| **Docker Compose** | 2.20+ | 2.24+ | `docker compose version` |

### 1.2 선택 소프트웨어

| 소프트웨어 | 용도 | 설치 방법 |
|------------|------|-----------|
| **Make** | 빌드 자동화 | `apt install make` / `brew install make` |
| **direnv** | 환경변수 관리 | `apt install direnv` / `brew install direnv` |
| **jq** | JSON 처리 | `apt install jq` / `brew install jq` |
| **httpie** | API 테스트 | `pip install httpie` |

### 1.3 권장 IDE 및 확장

**VS Code (권장)**

필수 확장:
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "usernamehw.errorlens"
  ]
}
```

**JetBrains (대안)**
- WebStorm (프론트엔드)
- PyCharm (백엔드)

---

## 2. 설치 가이드 (Installation Guide)

### 2.1 macOS

```bash
# Homebrew 설치 (없는 경우)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 필수 도구 설치
brew install git node@20 python@3.12 docker docker-compose

# Node.js 버전 관리 (nvm 권장)
brew install nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install 20
nvm use 20

# Python 버전 관리 (pyenv 권장)
brew install pyenv
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
source ~/.zshrc
pyenv install 3.12.0
pyenv global 3.12.0
```

### 2.2 Ubuntu/Debian

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y git curl wget build-essential

# Node.js 설치 (nvm 사용)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Python 설치 (pyenv 사용)
curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
pyenv install 3.12.0
pyenv global 3.12.0

# Docker 설치
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose 설치
sudo apt install docker-compose-plugin
```

### 2.3 Windows

```powershell
# Windows Subsystem for Linux (WSL2) 사용 권장
wsl --install

# WSL2 내에서 Ubuntu 가이드를 따르세요

# 또는 Windows 네이티브 설치:
# 1. Git: https://git-scm.com/download/win
# 2. Node.js: https://nodejs.org/ (LTS 버전)
# 3. Python: https://www.python.org/downloads/
# 4. Docker Desktop: https://www.docker.com/products/docker-desktop
```

---

## 3. 프로젝트 설정 (Project Setup)

### 3.1 저장소 클론

```bash
# HTTPS
git clone https://github.com/hallyulatino/hallyulatino.git

# SSH (권장)
git clone git@github.com:hallyulatino/hallyulatino.git

cd hallyulatino
```

### 3.2 환경변수 설정

```bash
# 환경변수 템플릿 복사
cp .env.example .env

# .env 파일 편집
# 아래 섹션 4를 참고하여 필요한 값을 설정하세요
```

### 3.3 Docker 개발 환경 실행

```bash
# 전체 서비스 빌드 및 실행
docker compose up -d --build

# 서비스 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 특정 서비스 로그만 확인
docker compose logs -f backend
docker compose logs -f frontend
```

### 3.4 로컬 개발 환경 (Docker 없이)

**프론트엔드:**
```bash
cd src/frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 린트
npm run lint
```

**백엔드:**
```bash
cd src/backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 데이터베이스 마이그레이션
alembic upgrade head

# 개발 서버 실행
uvicorn main:app --reload --port 8000

# 또는 make 사용
make run-backend
```

**AI Worker:**
```bash
cd src/worker

# 가상환경 활성화 (백엔드와 공유 가능)
source ../backend/venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# Celery Worker 실행
celery -A worker worker --loglevel=info
```

---

## 4. 환경변수 상세 (Environment Variables)

### 4.1 환경변수 템플릿 (.env.example)

```bash
# ═══════════════════════════════════════════════════════════════
# 🌐 HallyuLatino 환경변수 설정
# ═══════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────
# 애플리케이션 설정
# ─────────────────────────────────────────────────────────────────
APP_NAME=hallyulatino
APP_ENV=development  # development | staging | production
DEBUG=true
LOG_LEVEL=DEBUG      # DEBUG | INFO | WARNING | ERROR

# ─────────────────────────────────────────────────────────────────
# 프론트엔드 설정
# ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=              # Google Analytics ID (선택)

# ─────────────────────────────────────────────────────────────────
# 백엔드 설정
# ─────────────────────────────────────────────────────────────────
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000

# JWT 설정
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ─────────────────────────────────────────────────────────────────
# 데이터베이스 설정
# ─────────────────────────────────────────────────────────────────
# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hallyulatino
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hallyulatino

# Redis
REDIS_URL=redis://localhost:6379/0

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# ─────────────────────────────────────────────────────────────────
# 외부 서비스 API 키
# ─────────────────────────────────────────────────────────────────
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Pinecone (벡터 DB)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=hallyulatino

# ElevenLabs (AI 더빙)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# ─────────────────────────────────────────────────────────────────
# OAuth 설정
# ─────────────────────────────────────────────────────────────────
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# ─────────────────────────────────────────────────────────────────
# 결제 설정
# ─────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ─────────────────────────────────────────────────────────────────
# 스토리지 설정
# ─────────────────────────────────────────────────────────────────
# MinIO (로컬) / S3 (프로덕션)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET=hallyulatino
AWS_S3_ENDPOINT_URL=http://localhost:9000  # MinIO용

# ─────────────────────────────────────────────────────────────────
# Celery 설정
# ─────────────────────────────────────────────────────────────────
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# ─────────────────────────────────────────────────────────────────
# 모니터링 설정
# ─────────────────────────────────────────────────────────────────
SENTRY_DSN=                     # Sentry DSN (선택)
DATADOG_API_KEY=                # Datadog API Key (선택)
```

### 4.2 환경별 설정

| 환경 | 설명 | 특징 |
|------|------|------|
| `development` | 로컬 개발 | DEBUG=true, 상세 로그 |
| `staging` | 스테이징 | 프로덕션 유사, 테스트 데이터 |
| `production` | 프로덕션 | DEBUG=false, 최소 로그 |

---

## 5. Docker Compose 구성 (Docker Compose Configuration)

### 5.1 docker-compose.yml

```yaml
version: '3.8'

services:
  # ─────────────────────────────────────────────────────────────
  # 프론트엔드
  # ─────────────────────────────────────────────────────────────
  frontend:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./src/frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # 백엔드
  # ─────────────────────────────────────────────────────────────
  backend:
    build:
      context: ./src/backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./src/backend:/app
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hallyulatino
      - REDIS_URL=redis://redis:6379/0
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # AI Worker
  # ─────────────────────────────────────────────────────────────
  worker:
    build:
      context: ./src/worker
      dockerfile: Dockerfile.dev
    volumes:
      - ./src/worker:/app
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # PostgreSQL
  # ─────────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=hallyulatino
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # Redis
  # ─────────────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # Elasticsearch
  # ─────────────────────────────────────────────────────────────
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # MinIO (S3 호환 스토리지)
  # ─────────────────────────────────────────────────────────────
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - hallyulatino-network

  # ─────────────────────────────────────────────────────────────
  # Mailhog (개발용 메일 서버)
  # ─────────────────────────────────────────────────────────────
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - hallyulatino-network

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  minio_data:

networks:
  hallyulatino-network:
    driver: bridge
```

---

## 6. 서비스 접속 정보 (Service Access)

개발 환경 실행 후 접속 가능한 서비스:

| 서비스 | URL | 설명 |
|--------|-----|------|
| 프론트엔드 | http://localhost:3000 | Next.js 애플리케이션 |
| 백엔드 API | http://localhost:8000 | FastAPI 서버 |
| API 문서 (Swagger) | http://localhost:8000/docs | OpenAPI 문서 |
| API 문서 (ReDoc) | http://localhost:8000/redoc | ReDoc 형식 문서 |
| PostgreSQL | localhost:5432 | 데이터베이스 |
| Redis | localhost:6379 | 캐시/세션/큐 |
| Elasticsearch | http://localhost:9200 | 검색 엔진 |
| MinIO Console | http://localhost:9001 | 오브젝트 스토리지 UI |
| Mailhog | http://localhost:8025 | 개발용 메일 UI |

---

## 7. 데이터베이스 설정 (Database Setup)

### 7.1 마이그레이션 실행

```bash
cd src/backend

# 마이그레이션 생성
alembic revision --autogenerate -m "description"

# 마이그레이션 적용
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1

# 마이그레이션 히스토리 확인
alembic history
```

### 7.2 시드 데이터 로드

```bash
# 개발용 시드 데이터 로드
python scripts/seed_data.py

# 또는 make 사용
make seed-db
```

### 7.3 데이터베이스 리셋

```bash
# 주의: 모든 데이터가 삭제됩니다
docker compose down -v
docker compose up -d postgres
alembic upgrade head
python scripts/seed_data.py
```

---

## 8. 테스트 환경 (Test Environment)

### 8.1 테스트 실행

```bash
# 전체 테스트
make test

# 프론트엔드 테스트
cd src/frontend
npm run test
npm run test:coverage

# 백엔드 테스트
cd src/backend
pytest
pytest --cov=app --cov-report=html

# E2E 테스트
cd tests/e2e
npm run test:e2e
```

### 8.2 테스트 데이터베이스

테스트는 별도의 데이터베이스를 사용합니다:

```bash
# 테스트 DB 환경변수
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hallyulatino_test
```

---

## 9. 문제 해결 (Troubleshooting)

### 9.1 일반적인 문제

**포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

**Docker 볼륨 문제**
```bash
# 볼륨 초기화
docker compose down -v
docker volume prune -f
```

**Node.js 의존성 문제**
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

**Python 의존성 문제**
```bash
# 가상환경 재생성
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 9.2 Docker 관련 문제

**컨테이너가 시작되지 않음**
```bash
# 로그 확인
docker compose logs <service-name>

# 컨테이너 재빌드
docker compose build --no-cache <service-name>
```

**데이터베이스 연결 실패**
```bash
# PostgreSQL 컨테이너 상태 확인
docker compose ps postgres

# 직접 연결 테스트
docker compose exec postgres psql -U postgres -d hallyulatino
```

### 9.3 지원 요청

문제가 해결되지 않으면:
1. [GitHub Issues](https://github.com/hallyulatino/hallyulatino/issues)에 이슈 등록
2. 에러 메시지와 재현 단계를 포함해 주세요

---

## 10. 유용한 명령어 (Useful Commands)

### Makefile 명령어

```bash
make help           # 사용 가능한 명령어 목록
make setup          # 초기 설정 (의존성 설치, DB 설정)
make dev            # 개발 서버 실행
make test           # 전체 테스트 실행
make lint           # 린트 검사
make format         # 코드 포맷팅
make build          # 프로덕션 빌드
make clean          # 캐시 및 빌드 파일 정리
```

### Docker 명령어

```bash
docker compose up -d          # 백그라운드 실행
docker compose down           # 서비스 중지
docker compose logs -f        # 로그 스트리밍
docker compose exec backend bash  # 컨테이너 접속
docker compose restart backend    # 서비스 재시작
```

---

*이 문서는 개발 환경 설정의 Single Source of Truth입니다. 환경 관련 문제 발생 시 이 문서를 참고해 주세요.*
