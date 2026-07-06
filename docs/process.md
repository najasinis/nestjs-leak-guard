# 개발 프로세스 & 진행 현황

> 이 문서는 "지금 어디까지 왔고, 다음에 무엇을 할지"를 한눈에 보기 위한 작업 일지다.
> 마일스톤 단위로 갱신한다. 운영 규칙은 [CLAUDE.md](./CLAUDE.md), 함정 목록은
> [critical-notes.md](./critical-notes.md), 회고 워크플로는 [workflow.md](./workflow.md).
> 상세 사양은 [leak-guard-PRD.md](./leak-guard-PRD.md) /
> [leak-guard-api-spec.md](./leak-guard-api-spec.md) 참고.

---

## 📌 지금 여기 (Live Dashboard)

```
0단계 ✅ → 1번 ✅ → 2번 🔄 → 3번 ❌ → 4번 ✅ → 5번 🔄 → 6번 🔒
```

| 항목 | 값 |
|---|---|
| **현재 진입점** | 2번 마무리 — P2~P3 패턴 테스트(19 todo) 완성 후 3번 진입 |
| **최신 릴리즈** | v0.0.3 (npm publish ✅) |
| **다음 체크포인트** | P2~P3 패턴 테스트 완성 → `.leak-guard.json` config + ESLint 플러그인(3번) |
| **Gate A 상태** | ✅ 달성 — v0.0.3 npm publish 완료 |
| **다음 회고 시점** | 평가 20건 누적 시 `/eval-review` (Opus) |
| **블로커** | 없음 |
| **마지막 갱신** | 2026-07-06 |
| **테스트 현황** | 4 suites / 16 passed / 19 todo (P2~P3 패턴 테스트 미작성) |

### 매 세션 시작 시 자가 점검

```bash
# 1. 현재 브랜치/미커밋 변경 확인
git status

# 2. 빌드/테스트 그린 라인 유지 확인
npx tsc --noEmit && npx jest

# 3. origin과 동기화 상태 확인
git log --oneline origin/main..HEAD
git log --oneline HEAD..origin/main
```

위 3개가 깨끗하지 않으면 신규 작업 진입 금지. 우선 정리한다.

---

## 1. 전체 로드맵 (큰 그림)

PRD §10 마일스톤 기준:

| # | 카테고리 | 핵심 작업 | 상태 |
|---|---|---|---|
| **0** | Foundation | CLI 구조, tsconfig, package.json, AST 엔진 뼈대 | ✅ |
| 1 | P1 패턴 구현 | missing-tenant-filter, raw-query-with-input, password-logging | ✅ |
| 2 | P2~P3 패턴 + SQL | public-on-sensitive-endpoint, env-logging, cross-tenant-id-passing, enum-modify-existing, column-drop-with-data | 🔄 구현↑ 테스트↓ |
| 3 | 설정 파일 + 플러그인 | `.leak-guard.json`, ESLint 플러그인, tenant-shield 자동 감지 | ❌ |
| 4 | SARIF + GitHub Actions | SARIF 출력, CI/CD 파이프라인 | ✅ |
| 5 | 배포 준비 | README 완성, npm publish, CHANGELOG | 🔄 publish↑ 문서↓ |
| 6 | v0.2 기반 작업 | VS Code 확장, auto-fix, IDE 통합 | 🔒 |

---

## 2. ✅ 0단계 — Foundation

**커밋**: `f59b26c` — `Initial commit: NestJS Leak Guard static analysis tool`

### 완료된 항목

- [x] `package.json` — name, bin, scripts, dependencies (commander, chalk, typescript, ts-morph)
- [x] `tsconfig.json` — strict, target ES2020, outDir dist
- [x] `src/cli.ts` — `scan` 커맨드 등록, `--staged`, `--fail-on`, `--output`, `--config` 옵션
- [x] `src/scanner.ts` — 파일 목록 수집 + 패턴 실행 루프
- [x] `src/patterns/index.ts` — 패턴 레지스트리
- [x] `src/reporter/` — text / json / markdown / sarif 출력 포맷터
- [x] `src/types.ts` — `ScanResult`, `PatternResult`, `ScanOptions` 인터페이스
- [x] `src/config.ts` — 설정 로더
- [x] `src/utils/` — disable-markers, git, glob 유틸
- [x] `test/` — Jest 셋업 (ts-jest)
- [x] 빌드/테스트 그린 확인

---

## 3. ✅ 1번 — P1 패턴 3개 구현

**커밋**: `4555b08`, `dc76654`, `2158462`

### 완료된 항목

- [x] `src/patterns/missing-tenant-filter.ts` — Repository.find() 호출에 tenantId 없음 + @RequireTenant 없음
- [x] `src/patterns/raw-query-with-input.ts` — repo.query() 또는 dataSource.query()에 문자열 보간
- [x] `src/patterns/password-logging.ts` — console.log/logger에 password/pwd/secret 필드 사용
- [x] 각 패턴: 감지 / 통과 / 검사 제외 마커 테스트 (test/patterns/ 3 spec 파일)
- [x] `test/fixtures/` — 실제 .ts 픽스처 파일
- [x] `test/scanner.spec.ts` — 스캐너 통합 테스트

---

## 4. 🔄 2번 — P2~P3 패턴 + SQL 분석

> **현황**: 구현 완료, 테스트 19 todo 미작성. 이것부터 마무리한다.

### 구현 완료

- [x] `src/patterns/public-on-sensitive-endpoint.ts`
- [x] `src/patterns/env-logging.ts`
- [x] `src/patterns/cross-tenant-id-passing.ts`
- [x] `src/patterns/sql/enum-modify-existing.ts` (node-sql-parser 기반)
- [x] `src/patterns/sql/column-drop-with-data.ts`

### 남은 작업 (다음 진입점)

- [ ] `test/patterns/public-on-sensitive-endpoint.spec.ts` — 감지 / 통과 / disable 마커 케이스 3개 이상
- [ ] `test/patterns/env-logging.spec.ts` — 동일
- [ ] `test/patterns/cross-tenant-id-passing.spec.ts` — 동일
- [ ] `test/patterns/sql/enum-modify-existing.spec.ts`
- [ ] `test/patterns/sql/column-drop-with-data.spec.ts`
- [ ] `test/fixtures/` 하위 fixture 파일 보강
- [ ] `npx jest` — 19 todo → 0 todo 달성

---

## 5. ❌ 3번 — 설정 파일 + ESLint 플러그인 + tenant-shield 통합

> 2번 테스트 완성 후 진입.

### 체크리스트

- [ ] `.leak-guard.json` 스키마 확정 및 `src/config.ts` 완전 검증
- [ ] `eslint-plugin-nestjs-leak-guard` 패키지 구조 분리
- [ ] `package.json`의 `nestjs-tenant-shield` 감지 → `@RequireTenant` 자동 skip 로직
- [ ] `tenantIdField` 설정 연동
- [ ] 설정 파일 파싱 테스트

---

## 6. ✅ 4번 — SARIF + GitHub Actions

**커밋**: `8f97b80`, `170a010`

### 완료된 항목

- [x] `src/reporter/sarif.ts` — SARIF 2.1.0 포맷 출력
- [x] `.github/workflows/ci.yml` — CI 파이프라인
- [x] `.github/workflows/release.yml` — 릴리즈 파이프라인
- [x] SARIF flush 버그 수정 (process.exit 전 stdout flush)
- [x] CodeQL 업로드 권한 수정 (security-events permission, v4 업그레이드)

### 남은 작업

- [ ] `.husky/pre-commit` 설정 가이드 문서화
- [ ] `--output=markdown` 포맷 E2E 검증

---

## 7. 🔄 5번 — 배포 준비

> npm publish는 완료. 문서·CHANGELOG 정리 필요.

### 완료된 항목

- [x] `npm publish` v0.0.2, v0.0.3 (access public)
- [x] CI/CD 파이프라인 (release.yml)

### 남은 작업

- [ ] `README.md` 영문/한글 완성 — Quick Start, 패턴 목록 전체, CI 설정 가이드, disable 마커 사용법
- [ ] `CHANGELOG.md` — v0.0.1~v0.0.3 변경 이력
- [ ] npm version badge, CI badge

---

## 8. 🔒 6번 — v0.2 기반 작업

> 5번 완료 후 진입.

### 체크리스트

- [ ] VS Code 확장 (`vscode-nestjs-leak-guard`)
- [ ] auto-fix 제안 (quick fix)
- [ ] IDE 통합 (JetBrains)

---

## 9. 검증 현황 스냅샷

| 항목 | 상태 | 마지막 확인 |
|---|---|---|
| 타입체크 (`tsc --noEmit`) | ✅ 그린 | 2026-07-06 |
| Jest (전체) | ✅ 4 suites / 16 passed / 19 todo | 2026-07-06 |
| P1 패턴 (3개) | ✅ 구현 + 테스트 완료 | 2026-07-06 |
| P2~P3 패턴 (5개) | 🔄 구현↑ 테스트 19 todo | 2026-07-06 |
| SARIF 출력 | ✅ 구현 완료 | 2026-07-06 |
| GitHub Actions | ✅ ci.yml + release.yml | 2026-07-06 |
| npm publish | ✅ v0.0.3 | 2026-07-06 |
| Gate A (npm publish) | ✅ 달성 | 2026-07-06 |
| .leak-guard.json config | ❌ 미완 | — |
| ESLint 플러그인 | ❌ 미구현 | — |
| README 완성 | ❌ 미완 | — |
| CHANGELOG | ❌ 미작성 | — |

> 단계 마무리마다 이 표를 새 날짜로 갱신한다. "마지막 확인"이 7일 이상 지나면 신규 작업 진입 전 재검증.

---

## 10. 작업 운영 컨벤션

상세는 [CLAUDE.md](./CLAUDE.md) §3.

- **마일스톤 단위 커밋**: 각 단계 끝에서 빌드+테스트 통과 확인 후 1 커밋.
- **커밋 메시지**: conventional prefix(`feat`/`docs`/`test`/`fix`) + scope + 한국어 본문.
- **푸시**: 사용자 confirm 후.
- **검증 사이클**: `npx tsc --noEmit && npx jest`.
- **단계 마무리 시 사용자에게 보고**: 무엇을 끝냈고, 다음 진입점, 선택지.

---

## 11. 회고 누적 (Retrospective Log)

| 회고 일자 | 누적 평가 건수 | 채택된 패턴 | CLAUDE.md 반영 |
|---|---|---|---|
| (예정) | — | — | — |

---

## 12. 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-06-05 | 초안 작성 — PRD 기반으로 process.md + 전체 docs 구조 수립. |
| 2026-07-06 | 실제 구현 상태 반영 업데이트 — v0.0.3 publish 완료, 0단계·1번·4번 ✅, 2번 구현 완료·테스트 19 todo, 3번·5번(문서) 미완, 로드맵 재정렬. |
