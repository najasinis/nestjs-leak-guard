# Contributing to nestjs-leak-guard

이슈와 PR 환영합니다.

## 개발 환경 셋업

```bash
git clone https://github.com/jinyeong-jung/nestjs-leak-guard.git
cd nestjs-leak-guard
npm install
npm run typecheck  # tsc --noEmit
npm test
```

## 새 패턴 추가 방법

1. `src/patterns/<pattern-name>.ts` 생성 — `BasePattern` 상속
2. `src/patterns/index.ts` 레지스트리에 등록
3. `test/fixtures/<pattern-name>/` 하위에 픽스처 파일 생성:
   - `vulnerable.ts` — 감지되어야 하는 코드
   - `safe.ts` — 통과되어야 하는 코드
   - `disabled.ts` — 마커로 제외된 코드
4. `test/patterns/<pattern-name>.spec.ts` 테스트 작성
5. `docs/leak-guard-api-spec.md` 패턴 상세 문서 추가
6. `src/types.ts`의 `PatternId` 유니온 타입에 추가

## False Positive 신고

새 패턴은 FP 비율이 낮아야 합니다. 모든 PR에:
- 실제 취약한 코드에서 감지되는지 확인
- 실제 안전한 코드에서 통과하는지 확인
- 마커로 제외가 동작하는지 확인

## 커밋 컨벤션

```
feat(pattern): missing-tenant-filter 패턴 구현
fix(reporter): SARIF 출력 level 매핑 수정
test(fixtures): raw-query 픽스처 추가
docs: FAQ 업데이트
```
