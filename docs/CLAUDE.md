# Claude 작업 규칙 — nestjs-leak-guard

> 이 파일은 Claude Code가 이 프로젝트에서 일할 때 따르는 운영 규칙이다.
> 100줄 안팎 유지. 데이터 4건 이상 반복된 패턴만 규칙으로 격상한다.
> 변경 시 [process.md](./process.md) §변경 이력에 기록.

---

## 0. 작업 시작 전 필수 확인 (Top of the loop)

매 세션 시작 또는 새 작업 진입 시 다음을 **순서대로** 읽는다.

1. [process.md](./process.md) — "지금 여기"와 "다음 진입점" 확인
2. [critical-notes.md](./critical-notes.md) — 이 프로젝트에서 이미 발견된 함정 목록
3. [leak-guard-PRD.md](./leak-guard-PRD.md) §5 설계 원칙 — 5가지 원칙 위반 여부 셀프체크
4. 작업 디렉토리 git status — 미커밋 변경 사항 파악

이 4가지 없이 코드 손대지 않는다.

---

## 1. 프로젝트 정체성

- **이름**: nestjs-leak-guard (CLI 도구 + 선택적 ESLint 플러그인)
- **목표**: NestJS 코드에서 데이터 누출 위험 패턴을 코드 작성 시점에 정적 분석으로 사전 감지
- **현재 버전**: v0.0.1 (Foundation — CLI 구조, AST 엔진)
- **핵심 가치**: False Positive 최소화 + 명확한 수정 제안

---

## 2. 모델 선택 가이드

| 작업 유형 | 모델 | 이유 |
|---|---|---|
| AST 분석 패턴 설계, 아키텍처 | Opus | 복잡한 TypeScript Compiler API 구조 판단 |
| CLI, 패턴 룰 구현 | Sonnet | 비용 효율 |
| 테스트 작성, 문서 보강 | Sonnet | 충분 |
| 단순 리팩토링, 타입 정리 | Sonnet | 충분 |
| 회고 (/eval-review) | Opus | 패턴 추출은 Opus가 깊다 |

**자동 승격 트리거는 신뢰하지 않는다.** 위 표 기준으로 매번 명시적 선택.

---

## 3. 코딩 컨벤션 (검증된 것만)

### 3.1 AST 분석 규칙 (절대)
- 각 패턴은 **독립 파일**로 분리: `src/patterns/<pattern-name>.ts`
- 패턴 파일은 반드시 `PatternResult[]` 반환. null/undefined 반환 금지.
- False Positive 방지를 위해 **검사 제외 마커** (`// nestjs-leak-guard-disable-next-line`) 항상 지원.
- `@RequireTenant()` 가 적용된 메서드는 `missing-tenant-filter` skip. tenant-shield 시너지 필수.

### 3.2 CLI 출력 컨벤션
- HIGH: 즉시 exit 1 (--fail-on=high 기본값)
- 수정 제안(suggestion)은 코드 스니펫 형태로. "확인하세요" 류 모호한 메시지 금지.
- `--output=json` 출력은 `ScanResult[]` 스키마 유지 (API 명세 §8 참고).

### 3.3 테스트
- 각 패턴마다 **최소 3 케이스**: 감지됨 / 통과 / 검사 제외 마커.
- 테스트 픽스처는 `test/fixtures/<pattern-name>/` 하위에 실제 `.ts` 파일로 작성.
- e2e는 `examples/vulnerable-app/`에서 실제 스캔 돌려서 결과 검증.

### 3.4 커밋
- conventional prefix(`feat`/`docs`/`test`/`fix`) + scope + 한국어 본문.
- 마일스톤 단위로 커밋. 단계 끝에서 `npx tsc --noEmit && npx jest` 통과 후 1 커밋.
- push는 사용자 confirm 후.

---

## 4. 슬래시 커맨드 (자가 개선 루프)

상세는 [workflow.md](./workflow.md).

- `/eval` — 작업 직후 호출. `~/.claude/evaluations.md`에 양식대로 append.
- `/eval-review` — 평가 20건 이상 누적 시 Opus 회고 호출. 4건 이상 반복 패턴만 이 파일에 반영.
- `ccusage` — 비용 추적. 큰 작업 전후로 차분 확인.

---

## 5. 절대 금지

- **데이터 없는 규칙 추가**: "이러면 좋지 않을까?" 추측으로 이 파일 줄 늘리지 않는다. 4건 이상 반복 패턴만.
- **자동 트리거**: "X 상황이면 자동으로 Opus" 류 규칙.
- **destructive git**: `git reset --hard`, `push --force`, `rebase -i`, `--no-verify`. 사용자 명시 요청 시에만.
- **무단 의존성 추가**: peerDeps (Node 18+, TypeScript 4.7+) 깨지지 않도록.
- **Auto-fix 기능**: v0.1 범위 밖. 구현하지 않는다.

---

## 6. 응답 스타일

- 결과·결정 중심. 사고 과정 나열 금지.
- 파일·라인 인용은 markdown link 형식: `[process.md:42](./process.md#L42)`.
- 코드 블록 안 주석은 WHY가 비자명할 때만.
- 단계 마무리 시 보고: 무엇을 끝냈고, 다음 진입점은 무엇이고, 선택지가 있는지.

---

## 7. 변경 정책

이 파일을 수정할 때:
1. 추가하려는 규칙이 4건 이상 반복된 패턴인지 검증.
2. 신규 규칙 추가 시 효과 없는 기존 규칙 1개 제거 검토 (총량 유지).
3. [process.md](./process.md) §변경 이력에 기록.
