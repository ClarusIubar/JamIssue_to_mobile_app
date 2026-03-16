# JamIssue Docs Guide

이 폴더는 현재 구현과 운영 판단에 직접 필요한 문서만 남긴 기준 문서 묶음입니다.

원칙:

- 같은 내용을 여러 문서에 반복하지 않는다.
- 배포 값과 절차는 `growgardens-deploy-runbook.md` 하나에 모은다.
- Worker 실험 구조 설명은 `worker-first-poc.md` 하나에 모은다.
- 기능 정책은 기능별 문서에 둔다.
- PRD 대비 현황은 `prd-compliance.md` 를 기준으로 본다.

## 문서 지도

- [PRD 대비 체크](/D:/Code305/JamIssue/docs/prd-compliance.md)
  - 지금 무엇이 구현되었고 무엇이 아직 남았는지 보는 기준 문서
- [화면설계서](/D:/Code305/JamIssue/docs/screen-spec.md)
  - 모바일 화면 규칙과 화면별 UX 기준
- [사용자 경로 정책](/D:/Code305/JamIssue/docs/community-routes.md)
  - 스탬프 기반 경로 생성, 좋아요 정렬, 경로 스키마 원칙
- [계정/삭제 규칙](/D:/Code305/JamIssue/docs/account-identity-schema.md)
  - `user_id`, `user_identity`, 탈퇴/삭제 규칙
- [Worker-first POC](/D:/Code305/JamIssue/docs/worker-first-poc.md)
  - 현재 Worker 브랜치의 역할, 직접 처리 API, 한계
- [growgardens 배포 런북](/D:/Code305/JamIssue/docs/growgardens-deploy-runbook.md)
  - Cloudflare Pages/Worker/Supabase/네이버 설정값과 적용 순서

## 읽는 순서

1. 제품/기능 현황을 보려면 `prd-compliance.md`
2. 화면을 고치려면 `screen-spec.md`
3. 사용자 경로 기능을 만지려면 `community-routes.md`
4. 로그인/탈퇴/삭제 규칙을 보려면 `account-identity-schema.md`
5. Worker 브랜치 구조를 보려면 `worker-first-poc.md`
6. 실제 배포 값을 넣으려면 `growgardens-deploy-runbook.md`

## 정리 메모

이전의 날짜형 변경 문서, Docker 배포 초안, 시크릿 중복 문서는 현재 기준 문서에 흡수했다.
