# JamIssue Backend

JamIssue 백엔드는 FastAPI 기반입니다.  
로컬에서는 nginx가 `http://localhost:8000` 진입점을 맡고, FastAPI 앱은 내부적으로 `8001` 포트에서 동작합니다.

## 역할

- 장소, 후기, 댓글, 스탬프, 코스 관련 API 제공
- 소셜 로그인 인증 처리
- 관리자 요약 및 운영 API 제공
- 이미지 업로드 처리
- 데이터베이스 스키마와 운영 데이터 무결성 유지

## 데이터베이스 기준

- 기본 로컬 드라이버: `mysql+pymysql`
- 로컬 기본 URL: `mysql+pymysql://jamissue:jamissue@127.0.0.1:3306/jamissue?charset=utf8mb4`
- 로컬 스키마: [sql/schema.sql](sql/schema.sql)
- Supabase/Postgres 스키마: [sql/supabase_schema.sql](sql/supabase_schema.sql)

## 실행 방식

현재 로컬 실행은 `run_appserver.py` 기준입니다.

준비:

1. [`.env.example`](.env.example)을 `.env`로 복사
2. Python 3.14 준비
3. 필요 시 `backend/.venv/Lib/site-packages`에 의존성 설치

예시:

```powershell
cd D:\JamIssue\backend
py -3.14 -m pip install -r requirements.local.txt --target .venv/Lib/site-packages
```

직접 실행:

```powershell
cd D:\JamIssue\backend
py -3.14 run_appserver.py
```

일반적으로는 저장소 루트에서 아래 스크립트를 권장합니다.

```powershell
cd D:\JamIssue
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 start
```

## 계정 및 정체성 규칙

상세 규칙은 [docs/account-identity-schema.md](../docs/account-identity-schema.md)에 정리돼 있습니다.

요약:

- 내부 고유 계정 ID는 `user.user_id`
- 네이버, 카카오 같은 외부 계정 연결은 `user_identity`
- 같은 이메일이면 하나의 내부 계정으로 연결 가능
- 탈퇴 및 정리는 `user_id` 기준으로 수행

## 주요 API

- `GET /api/health`
- `GET /api/auth/me`
- `GET /api/auth/providers`
- `GET /api/auth/naver/login`
- `GET /api/auth/naver/callback`
- `GET /api/auth/kakao/login`
- `GET /api/auth/kakao/callback`
- `POST /api/auth/logout`
- `GET /api/bootstrap`
- `GET /api/places`
- `GET /api/courses`
- `GET /api/community-routes`
- `POST /api/community-routes`
- `POST /api/community-routes/{route_id}/like`
- `DELETE /api/community-routes/{route_id}`
- `GET /api/reviews`
- `POST /api/reviews`
- `DELETE /api/reviews/{review_id}`
- `GET /api/reviews/{review_id}/comments`
- `POST /api/reviews/{review_id}/comments`
- `DELETE /api/reviews/{review_id}/comments/{comment_id}`
- `POST /api/reviews/upload`
- `GET /api/my/summary`
- `DELETE /api/my/account`
- `GET /api/stamps`
- `POST /api/stamps/toggle`
- `GET /api/admin/summary`
- `PATCH /api/admin/places/{place_id}`
- `POST /api/admin/import/public-data`
- `POST /api/internal/public-events/import`

## 테스트

```powershell
cd D:\JamIssue\backend
py -3.14 -m pytest tests
```
