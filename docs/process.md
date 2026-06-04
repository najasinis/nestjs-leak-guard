# 개발 프로세스 & 진행 현황

> 이 문서는 "지금 어디까지 왔고, 다음에 무엇을 할지"를 한눈에 보기 위한 작업 일지다.
> 마일스톤 단위로 갱신한다. 운영 규칙은 [CLAUDE.md](./CLAUDE.md), 함정 목록은
> [critical-notes.md](./critical-notes.md), 회고 워크플로는 [workflow.md](./workflow.md).
> 상세 사양은 [leak-guard-PRD.md](./leak-guard-PRD.md) /
> [leak-guard-api-spec.md](./leak-guard-api-spec.md) 참고.

---

## 📌 지금 여기 (Live Dashboard)

```
0단계 ⏳ → 1번 🔒 → 2번 🔒 → 3번 🔒 → 4번 🔒 → 5번 🔒 → 6번 🔒
```

| 항목 | 값 |
|---|---|
| **현재 진입점** | 0단계 — Foundation (CLI 구조 + AST 엔진 셋업) |
| **최신 릴리즈** | 미배포 (v0.0.1 준비 중) |
| **다음 체크포인트** | 0단계 완료 → 1번(P1 패턴 3개) 진입 |
| **Gate A 상태** | ❌ 미달성 — npm publish 미완 |
| **다음 회고 시점** | 평가 20건 누적 시 `/eval-review` (Opus) |
| **블로커** | 없음 |
| **마지막 갱신** | 2026-06-05 |
| **테스트 현황** | 미구현 |

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
| **0** | Foundation | CLI 구조, tsconfig, package.json, AST 엔진 뼈대 | ⏳ |
| 1 | P1 패턴 구현 | missing-tenant-filter, raw-query-with-input, password-logging | 🔒 |
| 2 | P2~P3 패턴 + SQL | public-on-sensitive-endpoint, enum-modify-existing, column-drop | 🔒 |
| 3 | 설정 파일 + 플러그인 | `.leak-guard.json`, ESLint 플러그인, tenant-shield 자동 감지 | 🔒 |
| 4 | SARIF + GitHub Actions | SARIF 출력, pre-commit hook 가이드, Actions 예제 | 🔒 |
| 5 | 배포 준비 | README 영문/한글 완성, npm publish, 공개 발표 | 🔒 |
| 6 | v0.2 기반 작업 | VS Code 확장, auto-fix, IDE 통합 | 🔒 |

---

## 2. ⏳ 0단계 — Foundation

**목표**: `npx nestjs-leak-guard scan ./src` 한 줄이 실제로 돌아가는 뼈대.

### 체크리스트

- [ ] `package.json` — name, bin, scripts, dependencies (commander, chalk, typescript, ts-morph)
- [ ] `tsconfig.json` — strict, target ES2020, outDir dist
- [ ] `src/cli.ts` — `scan` 커맨드 등록, `--staged`, `--fail-on`, `--output`, `--config` 옵션
- [ ] `src/scanner.ts` — 파일 목록 수집 + 패턴 실행 루프
- [ ] `src/patterns/index.ts` — 패턴 레지스트리
- [ ] `src/reporter.ts` — text / json 출력 포맷터
- [ ] `src/types.ts` — `ScanResult`, `PatternResult`, `ScanOptions` 인터페이스
- [ ] `test/` — Jest 셋업 (ts-jest)
- [ ] 빌드/테스트 그린 확인: `npx tsc --noEmit && npx jest`

---

## 3. 🔒 1번 — P1 패턴 3개 구현

> 0단계 완료 후 진입.

### 체크리스트

- [ ] `src/patterns/missing-tenant-filter.ts` — Repository.find() 호출에 tenantId 없음 + @RequireTenant 없음
- [ ] `src/patterns/raw-query-with-input.ts` — repo.query() 또는 dataSource.query()에 문자열 보간
- [ ] `src/patterns/password-logging.ts` — console.log/logger에 password/pwd/secret 필드 사용
- [ ] 각 패턴: 감지 / 통과 / 검사 제외 마커 테스트 3케이스 이상
- [ ] `test/fixtures/` 하위에 실제 .ts 픽스처 파일 작성
- [ ] `examples/vulnerable-app/` — 실제 스캔 e2e 검증

---

## 4. 🔒 2번 — P2~P3 패턴 + SQL 분석

> 1번 완료 후 진입.

### 체크리스트

- [ ] `src/patterns/public-on-sensitive-endpoint.ts`
- [ ] `src/patterns/env-logging.ts`
- [ ] `src/patterns/cross-tenant-id-passing.ts`
- [ ] `src/patterns/enum-modify-existing.ts` (node-sql-parser 기반)
- [ ] `src/patterns/column-drop-with-data.ts`
- [ ] SQL 파일 스캔 지원 (.sql, migration 파일)

---

## 5. 🔒 3번 — 설정 파일 + ESLint 플러그인 + tenant-shield 통합

> 2번 완료 후 진입.

### 체크리스트

- [ ] `.leak-guard.json` 파싱 (`src/config.ts`)
- [ ] `eslint-plugin-nestjs-leak-guard` 패키지 구조 분리
- [ ] `package.json`의 `nestjs-tenant-shield` 감지 → `@RequireTenant` 자동 skip 로직
- [ ] `tenantIdField` 설정 연동

---

## 6. 🔒 4번 — SARIF + GitHub Actions

> 3번 완료 후 진입.

### 체크리스트

- [ ] `src/reporter/sarif.ts` — SARIF 2.1.0 포맷 출력
- [ ] `.github/workflows/leak-guard.yml` 예제
- [ ] `.husky/pre-commit` 설정 가이드
- [ ] `--output=markdown` 포맷 추가

---

## 7. 🔒 5번 — 배포 준비

> 4번 완료 후 진입.

### 체크리스트

- [ ] README.md 영문/한글 완성 (Quick Start, 패턴 목록, CI 설정 가이드)
- [ ] npm version badge, CI badge
- [ ] `npm publish` (access public)
- [ ] CHANGELOG.md

---

## 8. 검증 현황 스냅샷

| 항목 | 상태 | 마지막 확인 |
|---|---|---|
| 타입체크 (`tsc --noEmit`) | ❌ 미구현 | — |
| Jest | ❌ 미구현 | — |
| origin/main 동기화 | ❌ 미push | — |
| npm publish | ❌ 미배포 | — |
| P1 패턴 (3개) | ❌ 미구현 | — |
| P2~P3 패턴 + SQL | ❌ 미구현 | — |
| SARIF 출력 | ❌ 미구현 | — |
| Gate A (npm publish) | ❌ 미달성 | — |

> 단계 마무리마다 이 표를 새 날짜로 갱신한다.

---

## 9. 작업 운영 컨벤션

상세는 [CLAUDE.md](./CLAUDE.md) §3.

- **마일스톤 단위 커밋**: 각 단계 끝에서 빌드+테스트 통과 확인 후 1 커밋.
- **커밋 메시지**: conventional prefix + scope + 한국어 본문.
- **푸시**: 사용자 confirm 후.
- **검증 사이클**: `npx tsc --noEmit && npx jest`.
- **단계 마무리 시 사용자에게 보고**: 무엇을 끝냈고, 다음 진입점, 선택지.

---

## 10. 회고 누적 (Retrospective Log)

| 회고 일자 | 누적 평가 건수 | 채택된 패턴 | CLAUDE.md 반영 |
|---|---|---|---|
| (예정) | — | — | — |

---

## 11. 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-06-05 | 초안 작성 — PRD 기반으로 process.md + 전체 docs 구조 수립. |
