# JamIssue growgardens 배포 런북

기준 브랜치: `codex/worker-first-poc`

이 문서는 현재 배포에 필요한 값과 순서를 한 군데에 모은 기준 문서다.

## 현재 배포 구조

```text
Frontend
-> Cloudflare Pages (jamissue-web)

API
-> Cloudflare Worker (jamissue-api)
-> Supabase REST / Storage

Optional
-> FastAPI origin
```

## 현재 직접 동작하는 범위

- 네이버 로그인 시작 / callback / 세션 확인
- 장소 / 후기 / 추천 경로 조회
- 후기 이미지 업로드
- 후기 작성 / 댓글 작성 / 후기 좋아요
- 현장 반경 기반 스탬프 적립
- 사용자 생성 경로 작성 / 좋아요

## 아직 남은 범위

- 카카오 OAuth 실제 구현
- 관리자 수정 / 운영 API
- 필요 시 `APP_ORIGIN_API_URL` 기반 FastAPI fallback 연결

## 1. Supabase SQL 적용

Supabase Dashboard -> SQL Editor 에서 아래 순서로 실행:

1. [supabase_schema.sql](/D:/Code305/JamIssue/backend/sql/supabase_schema.sql)
2. [supabase_seed.sql](/D:/Code305/JamIssue/backend/sql/supabase_seed.sql)
3. [supabase_storage.sql](/D:/Code305/JamIssue/backend/sql/supabase_storage.sql)

## 2. Cloudflare Pages 값

프로젝트: `jamissue-web`  
위치: `Workers & Pages -> jamissue-web -> Settings -> Environment variables`

```env
PUBLIC_APP_BASE_URL=https://api.jamissue.growgardens.app
PUBLIC_NAVER_MAP_CLIENT_ID=<네이버 지도 Dynamic Map Client ID>
```

의미:

- `PUBLIC_APP_BASE_URL`: 프론트가 호출할 API 주소
- `PUBLIC_NAVER_MAP_CLIENT_ID`: 네이버 지도 Dynamic Map 키

## 3. Cloudflare Worker Variables

프로젝트: `jamissue-api`  
위치: `Workers & Pages -> jamissue-api -> Settings -> Variables and Secrets -> Variables`

```env
APP_ENV=worker-first
APP_SESSION_HTTPS=true
APP_FRONTEND_URL=https://jamissue.growgardens.app
APP_CORS_ORIGINS=https://jamissue.growgardens.app
APP_NAVER_LOGIN_CALLBACK_URL=https://api.jamissue.growgardens.app/api/auth/naver/callback
APP_STORAGE_BACKEND=supabase
APP_SUPABASE_URL=https://ifofgcaqrgtiurzqhiyy.supabase.co
APP_SUPABASE_STORAGE_BUCKET=review-images
APP_STAMP_UNLOCK_RADIUS_METERS=120
APP_ORIGIN_API_URL=
```

의미:

- `APP_FRONTEND_URL`: 로그인 후 돌아갈 프론트 주소
- `APP_CORS_ORIGINS`: 브라우저 호출 허용 origin
- `APP_NAVER_LOGIN_CALLBACK_URL`: 네이버 callback 주소
- `APP_STORAGE_BACKEND`: 현재 `supabase`
- `APP_SUPABASE_URL`: Supabase 프로젝트 URL
- `APP_SUPABASE_STORAGE_BUCKET`: 후기 이미지 버킷
- `APP_STAMP_UNLOCK_RADIUS_METERS`: 후기/스탬프 공통 반경
- `APP_ORIGIN_API_URL`: 아직 Worker에 없는 API를 FastAPI origin으로 넘길 때만 사용

## 4. Cloudflare Worker Secrets

프로젝트: `jamissue-api`  
위치: `Workers & Pages -> jamissue-api -> Settings -> Variables and Secrets -> Secrets`

```env
APP_SESSION_SECRET=<랜덤 64자 이상>
APP_JWT_SECRET=<랜덤 64자 이상>
APP_DATABASE_URL=postgres://postgres.<project-ref>:<DB_PASSWORD>@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
APP_SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
APP_NAVER_LOGIN_CLIENT_ID=<네이버 로그인 Client ID>
APP_NAVER_LOGIN_CLIENT_SECRET=<네이버 로그인 Client Secret>
```

## 5. 네이버 개발자센터 등록값

- 서비스 URL: `https://jamissue.growgardens.app`
- Callback URL: `https://api.jamissue.growgardens.app/api/auth/naver/callback`

## 6. 확인 주소

- 프론트: `https://jamissue.growgardens.app`
- API: `https://api.jamissue.growgardens.app`
- Worker 기본 주소: `https://jamissue-api.yhh4433.workers.dev`

## 7. 운영 메모

- 카카오는 아직 비활성이다.
- Worker 브랜치는 메인 FastAPI 아키텍처를 대체하는 확정안이 아니라 배포 실험 브랜치다.
- 관리자 API까지 Worker로 올리지 않으면 `APP_ORIGIN_API_URL` 을 비워 두고 써도 된다.
