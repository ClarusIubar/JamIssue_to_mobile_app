# JamIssue

대전 관광객, 특히 20~30대 여성을 주요 타겟으로 하는 모바일 우선 여행 서비스 MVP입니다.  
"노잼 도시"라는 인식을 벗기고, 대전의 장소를 더 직관적이고 귀엽게 고르게 만드는 것을 목표로 합니다.

현재 로컬 구조는 `React + TypeScript 정적 프론트 + nginx + FastAPI + portable MySQL` 입니다.

## 현재 범위

- 대전 중심 지도 탐색
- 카테고리별 장소 필터
- 기분별 코스 보기
- 장소 상세 시트
- 네이버 로그인
- 후기 / 댓글 / 이미지 업로드
- 마이페이지
- 관리자 장소 노출 제어
- 위치 반경 기반 스탬프 적립

## 기준 문서

- PRD 대비 구현 체크리스트: [docs/prd-compliance.md](D:/Code305/JamIssue/docs/prd-compliance.md)
- 화면설계서: [docs/screen-spec.md](D:/Code305/JamIssue/docs/screen-spec.md)
- 백엔드 실행 문서: [backend/README.md](D:/Code305/JamIssue/backend/README.md)
- nginx 로컬 실행 문서: [infra/nginx/README.md](D:/Code305/JamIssue/infra/nginx/README.md)
- DB 스키마: [backend/sql/schema.sql](D:/Code305/JamIssue/backend/sql/schema.sql)

## 로컬 진입 주소

- 앱: `http://localhost:8000`
- 백엔드 API: `http://localhost:8000/api`
- 상태 확인: `http://localhost:8000/api/health`

## 빠른 시작

처음 한 번만:

```powershell
cd D:/Code305/JamIssue
npm.cmd install
powershell -ExecutionPolicy Bypass -File D:/Code305/JamIssue/scripts/install-local-nginx.ps1
powershell -ExecutionPolicy Bypass -File D:/Code305/JamIssue/scripts/install-local-mysql.ps1
```

평소 실행:

```powershell
powershell -ExecutionPolicy Bypass -File D:/Code305/JamIssue/scripts/dev.ps1 start
powershell -ExecutionPolicy Bypass -File D:/Code305/JamIssue/scripts/dev.ps1 status
powershell -ExecutionPolicy Bypass -File D:/Code305/JamIssue/scripts/dev.ps1 logs
powershell -ExecutionPolicy Bypass -File D:/Code305/JamIssue/scripts/dev.ps1 stop
```

프론트만 다시 빌드할 때:

```powershell
npm.cmd run build
```

## 환경 변수

루트 [`.env`](D:/Code305/JamIssue/.env)는 브라우저에 노출되어도 되는 값만 둡니다.

```bash
PUBLIC_APP_BASE_URL=http://localhost:8000
PUBLIC_NAVER_MAP_CLIENT_ID=YOUR_NAVER_MAP_CLIENT_ID
```

백엔드 [backend/.env](D:/Code305/JamIssue/backend/.env)는 서버 전용 값을 둡니다.

```bash
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8001
APP_CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
APP_FRONTEND_URL=http://localhost:8000
APP_SESSION_SECRET=CHANGE_ME_LOCAL_SESSION_SECRET
APP_SESSION_HTTPS=false
APP_DATABASE_URL=mysql+pymysql://jamissue:jamissue@127.0.0.1:3306/jamissue?charset=utf8mb4
APP_NAVER_LOGIN_CLIENT_ID=YOUR_NAVER_LOGIN_CLIENT_ID
APP_NAVER_LOGIN_CLIENT_SECRET=YOUR_NAVER_LOGIN_CLIENT_SECRET
APP_NAVER_LOGIN_CALLBACK_URL=http://localhost:8000/api/auth/naver/callback
APP_ADMIN_USER_IDS=
```

운영 대시보드는 `APP_ADMIN_USER_IDS` 에 지정한 사용자 ID에게만 보입니다.

## 네이버 Maps API 선택

현재 PRD와 구현 기준으로는 `Dynamic Map` 만 먼저 발급받으면 됩니다.

지금 단계에서 필요한 것:

- `Dynamic Map`

지금 단계에서 불필요한 것:

- `Static Map`
- `Directions 5`
- `Directions 15`
- `Geocoding`
- `Reverse Geocoding`

즉, 네이버 Cloud 콘솔에서 Maps Application을 만들 때 `Dynamic Map` 만 선택하면 됩니다.

## 네이버 키 운용 원칙

- 지도용 키와 로그인용 키는 분리합니다.
- 지도용 키는 루트 [`.env`](D:/Code305/JamIssue/.env)의 `PUBLIC_NAVER_MAP_CLIENT_ID` 로 넣습니다.
- 로그인용 `Client ID / Client Secret` 은 [backend/.env](D:/Code305/JamIssue/backend/.env)의 `APP_NAVER_LOGIN_CLIENT_ID`, `APP_NAVER_LOGIN_CLIENT_SECRET` 로 넣습니다.
- `NAVER_MAP_SECRET` 값은 현재 Dynamic Map 렌더링에는 사용하지 않습니다.

개발용 지도 키 주의:

- `localhost` 나 `127.0.0.1` 로 등록한 지도 키는 브라우저에서 직접 쓰이는 개발용 키입니다.
- 따라서 "비밀 키"처럼 보호된다고 생각하면 안 됩니다.
- 개발용 키와 운영용 키는 반드시 분리합니다.
- 개발용 키는 로컬 전용 앱으로 발급하고 사용량 제한과 알림을 걸어 둡니다.
- 운영용 키는 실제 서비스 도메인만 등록한 별도 앱으로 발급합니다.

## 현재 API 범위

- `GET /api/health`
- `GET /api/auth/me`
- `GET /api/auth/providers`
- `GET /api/auth/naver/login`
- `GET /api/auth/naver/callback`
- `POST /api/auth/logout`
- `GET /api/bootstrap`
- `GET /api/places`
- `GET /api/places/{place_id}`
- `GET /api/courses`
- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/reviews/{review_id}/comments`
- `POST /api/reviews/{review_id}/comments`
- `POST /api/reviews/upload`
- `GET /api/my/summary`
- `GET /api/stamps`
- `POST /api/stamps/toggle`
- `GET /api/admin/summary`
- `PATCH /api/admin/places/{place_id}`
- `POST /api/admin/import/public-data`

## 현재 구현 상태 요약

현재 저장소는 "화면만 있는 목업"은 아닙니다.  
다만 PRD 전체가 끝난 상태도 아닙니다.

완료 또는 동작 중:

- 지도 탐색
- 코스 탭
- 스탬프 탭
- 네이버 로그인
- 후기 / 댓글 / 이미지 업로드
- 마이페이지
- 관리자 패널
- 로컬 nginx + FastAPI + MySQL 스택

아직 남은 축:

- UI/UX 완성도 정리
- 후기 작성 권한을 스탬프 적립 정책과 연결
- 공공데이터 정식 연동
- 카카오 / 구글 / Apple 로그인
- 프론트 테스트 / E2E / 모바일 QA
- 운영 배포 / 관측성 / KPI

상세 상태는 [docs/prd-compliance.md](D:/Code305/JamIssue/docs/prd-compliance.md) 를 기준으로 관리합니다.

## 다음 작업 우선순위

1. 화면설계서 기준으로 탐색 / 코스 / 스탬프 탭 UI 정리
2. 후기 작성 권한을 `스탬프 적립 후 24시간 이내` 정책과 연결
3. 공공데이터 정식 연동 방식 확정
4. 모바일 QA 체크리스트 축적
5. 운영 배포와 관측성 문서화
