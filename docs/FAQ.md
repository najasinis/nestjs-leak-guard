# FAQ — nestjs-leak-guard

> 자주 묻는 질문. 반복 이슈 발생 시 이 파일에 추가.

---

## Q1. ESLint 이미 쓰는데 이 도구가 추가로 필요한가요?

**A.** 기존 ESLint 룰은 일반 TypeScript 패턴을 검사합니다.
nestjs-leak-guard는 다음을 추가로 감지합니다:
- TypeORM/Prisma 쿼리에서 `tenantId` 누락
- `@RequireTenant()` 없는 Repository 쿼리
- NestJS 데코레이터 컨텍스트 기반 인증 우회 패턴
- SQL 마이그레이션 파일의 데이터 손실 위험

두 도구는 겹치지 않는 영역을 커버합니다. 함께 사용을 권장합니다.

---

## Q2. `nestjs-tenant-shield`와 같이 써야 하나요?

**A.** 아니요, 독립적으로 사용 가능합니다.
다만 함께 쓰면 시너지가 있습니다:
- `nestjs-tenant-shield`가 설치된 경우, `@RequireTenant()`가 적용된 메서드는 `missing-tenant-filter` 검사를 자동 skip합니다 (False Positive 감소).
- Static(코드 작성 시점) + Runtime(실행 시점) 두 층 방어가 됩니다.

---

## Q3. False Positive가 너무 많아요.

**A.** 두 가지 방법으로 억제할 수 있습니다:

**방법 1: 특정 라인 검사 제외**
```typescript
// nestjs-leak-guard-disable-next-line missing-tenant-filter
async findAllSystem() {
  return this.repo.find(); // 시스템 cron — 의도적
}
```

**방법 2: `.leak-guard.json`에서 규칙 조정**
```json
{
  "rules": {
    "missing-tenant-filter": "warn"
  }
}
```

---

## Q4. 기존 레거시 코드에 적용하면 수백 개 경고가 뜰 것 같아요.

**A.** `--patterns` 옵션으로 특정 패턴만 실행할 수 있습니다:
```bash
# 가장 위험한 패턴만 먼저
npx nestjs-leak-guard scan ./src --patterns=password-logging,raw-query-with-input

# 신규 코드만 (staged 파일만)
npx nestjs-leak-guard scan --staged --fail-on=high
```

새 코드에만 적용하고 레거시는 점진적으로 줄여가는 방식을 권장합니다.

---

## Q5. GitHub Actions에서 SARIF 결과가 Security 탭에 안 나와요.

**A.** 다음 조건이 모두 충족되어야 합니다:
1. `--output=sarif` 옵션으로 `leak-guard.sarif` 파일 생성
2. `github/codeql-action/upload-sarif@v2` 스텝이 있어야 함
3. 레포지토리가 public이거나 GitHub Advanced Security 활성화 필요

```yaml
- run: npx nestjs-leak-guard scan ./src --fail-on=high --output=sarif
  continue-on-error: true   # sarif 업로드를 위해 실패해도 계속
- uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: leak-guard.sarif
```

---

## Q6. TypeORM 말고 Mongoose/MikroORM도 지원하나요?

**A.** v0.1은 TypeORM + Prisma 패턴만 지원합니다.
Mongoose/MikroORM 지원은 GitHub Issue로 요청해 주세요. 수요 확인 후 v0.2 로드맵에 반영합니다.

---

## Q7. SQL 마이그레이션 파일은 어떤 형식을 지원하나요?

**A.** `.sql` 확장자 파일을 node-sql-parser로 분석합니다.
TypeORM migration 클래스 (`.ts` 파일 안의 `up()` 메서드)는 v0.2에서 지원 예정입니다.
