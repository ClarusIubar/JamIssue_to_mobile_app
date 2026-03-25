# JamIssue

JamIssue는 대전 장소 탐색, 스탬프, 피드, 코스를 연결하는 웹 앱입니다.

## 운영 기준

- 배포 브랜치: `main`
- 프런트 도메인: `https://daejeon.jamissue.com`
- API 도메인: `https://api.daegeon.jamissue.com`
- Pages 프로젝트: `daejeon-jamissue-pages`
- Worker 프로젝트: `daejeon-jamissue-api`
- 데이터/스토리지: Supabase

`main`에 push 또는 merge 되면 GitHub Actions가 배포를 수행합니다.

## 배포 흐름

### PR to `main`

- 프런트 `npm ci`, `npm run typecheck`, `npm run build`
- 백엔드 `pytest`
- Pages preview 배포
- Worker `wrangler deploy --dry-run`

### Push to `main`

- 프런트/백엔드 검증
- `daejeon-jamissue-pages`에 Pages production 배포
- `daejeon-jamissue-api`에 Worker production 배포

## 어디에 어떤 값을 넣는가

### GitHub Repository Secrets

위치:
`GitHub > Repository > Settings > Secrets and variables > Actions > Repository secrets`

```env
CLOUDFLARE_API_TOKEN=<Cloudflare API token>
CLOUDFLARE_ACCOUNT_ID=<Cloudflare account id>
```

### GitHub Repository Variables

위치:
`GitHub > Repository > Settings > Secrets and variables > Actions > Repository variables`

```env
PUBLIC_APP_BASE_URL=https://api.daegeon.jamissue.com
PUBLIC_NAVER_MAP_CLIENT_ID=<NAVER_MAP_CLIENT_ID>
```

설명:
- `PUBLIC_APP_BASE_URL`: 프런트가 호출할 API 주소
- `PUBLIC_NAVER_MAP_CLIENT_ID`: 네이버 지도용 값

### Cloudflare Worker Variables

위치:
`Cloudflare Dashboard > Workers & Pages > daejeon-jamissue-api > Settings > Variables and Secrets > Variables`

```env
APP_ENV=worker-first
APP_SESSION_HTTPS=true
APP_FRONTEND_URL=https://daejeon.jamissue.com
APP_CORS_ORIGINS=https://daejeon.jamissue.com
APP_NAVER_LOGIN_CLIENT_ID=<NAVER_LOGIN_CLIENT_ID>
APP_NAVER_LOGIN_CALLBACK_URL=https://api.daegeon.jamissue.com/api/auth/naver/callback
APP_STORAGE_BACKEND=supabase
APP_SUPABASE_URL=https://<project-ref>.supabase.co
APP_SUPABASE_STORAGE_BUCKET=review-images
APP_STAMP_UNLOCK_RADIUS_METERS=120
APP_PUBLIC_EVENT_SOURCE_URL=https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api
```

설명:
- `APP_NAVER_LOGIN_CLIENT_ID`: 네이버 로그인용 값
- `APP_NAVER_LOGIN_CALLBACK_URL`: 네이버 로그인 callback 주소
- `APP_FRONTEND_URL`, `APP_CORS_ORIGINS`: 프런트 도메인과 동일해야 함

### Cloudflare Worker Secrets

위치:
`Cloudflare Dashboard > Workers & Pages > daejeon-jamissue-api > Settings > Variables and Secrets > Secrets`

```env
APP_SESSION_SECRET=<random 64+ chars>
APP_JWT_SECRET=<random 64+ chars>
APP_DATABASE_URL=postgres://postgres.<project-ref>:<DB_PASSWORD>@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
APP_SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
APP_NAVER_LOGIN_CLIENT_SECRET=<NAVER_LOGIN_CLIENT_SECRET>
APP_PUBLIC_EVENT_SERVICE_KEY=<DATA_GO_KR_SERVICE_KEY>
```

설명:
- `APP_NAVER_LOGIN_CLIENT_SECRET`: 네이버 로그인 secret
- `APP_SESSION_SECRET`, `APP_JWT_SECRET`: Worker 세션/서명용 secret

## 네이버 기준

### 지도

- 프런트에서 사용
- 필요한 값: `PUBLIC_NAVER_MAP_CLIENT_ID`
- 넣는 곳: GitHub Repository Variables

### 로그인

- Worker에서 사용
- 필요한 값:
  - `APP_NAVER_LOGIN_CLIENT_ID`
  - `APP_NAVER_LOGIN_CLIENT_SECRET`
  - `APP_NAVER_LOGIN_CALLBACK_URL`
- 넣는 곳:
  - `CLIENT_ID`, `CALLBACK_URL`: Worker Variables
  - `CLIENT_SECRET`: Worker Secrets

### 네이버 개발자센터

입력값:

```text
서비스 URL
https://daejeon.jamissue.com

Callback URL
https://api.daegeon.jamissue.com/api/auth/naver/callback
```

## 수동 명령

Pages 프로젝트 생성:

```powershell
cd D:\JamIssue
.\scripts\create-cloudflare-pages-project.ps1
```

Pages 수동 배포:

```powershell
cd D:\JamIssue
.\scripts\deploy-cloudflare-pages.ps1
```

## 로컬 검증

```powershell
cd D:\JamIssue
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

```powershell
cd D:\JamIssue\backend
python -m pytest tests
```

## 참고 문서

- [docs/README.md](/D:/JamIssue/docs/README.md)
- [docs/growgardens-deploy-runbook.md](/D:/JamIssue/docs/growgardens-deploy-runbook.md)
- [backend/README.md](/D:/JamIssue/backend/README.md)
