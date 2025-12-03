# Security Incident Response Guide

## Git 이력에서 민감한 데이터 삭제 방법

### 사전 주의사항

> ⚠️ **경고**: 이 작업은 Git 이력을 변경합니다. 모든 협업자에게 영향을 미치며, 되돌릴 수 없습니다.

1. 작업 전 반드시 백업 생성
2. 모든 협업자에게 사전 공지
3. 모든 브랜치에서 작업 필요

---

## 방법 1: git filter-branch (레거시)

```bash
# 1. 저장소 백업
git clone --mirror https://github.com/USER/REPO.git backup-repo

# 2. 특정 파일 삭제
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PATH/TO/SENSITIVE_FILE" \
  --prune-empty --tag-name-filter cat -- --all

# 3. 강제 푸시
git push origin --force --all
git push origin --force --tags

# 4. 로컬 정리
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 방법 2: BFG Repo-Cleaner (권장)

더 빠르고 간단한 방법입니다.

### 설치

```bash
# macOS
brew install bfg

# 또는 직접 다운로드
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

### 사용법

```bash
# 1. Mirror 클론
git clone --mirror https://github.com/USER/REPO.git

# 2. 특정 파일 삭제
bfg --delete-files "FILENAME" REPO.git

# 3. 특정 패턴 삭제
bfg --delete-files "*.key" REPO.git
bfg --delete-files "*.env" REPO.git

# 4. 텍스트 치환 (비밀번호/토큰 제거)
echo "ACTUAL_SECRET_VALUE" > passwords.txt
bfg --replace-text passwords.txt REPO.git

# 5. 정리 및 푸시
cd REPO.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

---

## 방법 3: git filter-repo (최신 권장)

```bash
# 설치
pip install git-filter-repo

# 특정 파일 삭제
git filter-repo --invert-paths --path PATH/TO/SENSITIVE_FILE

# 특정 패턴 삭제
git filter-repo --invert-paths --path-glob '*.key'

# 강제 푸시
git push origin --force --all
```

---

## GitHub에서 캐시 삭제 요청

Git 이력 삭제 후에도 GitHub 캐시에 데이터가 남아있을 수 있습니다.

### 1. GitHub Support 연락

- https://support.github.com/contact 접속
- "Remove cached views" 선택
- 삭제할 커밋 SHA 또는 파일 경로 제공

### 2. GitHub CLI 사용

```bash
# 캐시된 뷰 삭제 요청 (GitHub Support 필요)
gh api repos/{owner}/{repo}/git/refs/heads/main --method DELETE
```

---

## 사후 조치

### 1. 자격 증명 교체

노출된 모든 자격 증명은 **반드시 교체**해야 합니다:

- [ ] API 키 재발급
- [ ] 비밀번호 변경
- [ ] OAuth 토큰 폐기 및 재발급
- [ ] SSH 키 교체
- [ ] 클라우드 자격 증명 교체

### 2. 협업자 통보

```bash
# 모든 협업자에게 로컬 저장소 재설정 요청
git fetch origin
git reset --hard origin/main
```

### 3. 브랜치 보호 규칙 확인

- Force push 제한 설정
- 서명된 커밋 요구
- PR 리뷰 필수 설정

---

## 예방 조치

### 1. Pre-commit Hook 설정

```bash
# .git/hooks/pre-commit
#!/bin/sh

# 민감한 파일 패턴 검사
if git diff --cached --name-only | grep -E '\.(key|pem|env)$'; then
  echo "Error: Attempting to commit sensitive files"
  exit 1
fi

# 비밀 패턴 검사
if git diff --cached | grep -E '(password|secret|api_key)\s*=\s*["\047]'; then
  echo "Error: Potential secret detected"
  exit 1
fi
```

### 2. GitHub Secret Scanning 활성화

Repository Settings → Security → Secret scanning 활성화

### 3. .gitignore 유지

```bash
# 주기적으로 확인
git check-ignore -v .env
git check-ignore -v *.key
```

---

## 긴급 연락처

- GitHub Security: security@github.com
- GitHub Support: https://support.github.com

---

## 참고 자료

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
