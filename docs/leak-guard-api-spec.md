# nestjs-leak-guard API 명세

> CLI 인터페이스, 설정 파일 스키마, 출력 포맷, 패턴 상세 정의.

---

## 1. CLI 인터페이스

### 기본 구조

```bash
npx nestjs-leak-guard <command> [options]
```

### `scan` 커맨드

```bash
npx nestjs-leak-guard scan [path] [options]
```

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `path` | `./src` | 스캔할 경로 (파일 또는 디렉토리) |
| `--staged` | false | git staging area의 파일만 스캔 |
| `--fail-on <level>` | `high` | 지정 등급 이상 발견 시 exit 1 (`high` / `medium` / `low` / `none`) |
| `--output <format>` | `text` | 출력 포맷 (`text` / `json` / `sarif` / `markdown`) |
| `--config <path>` | `.leak-guard.json` | 설정 파일 경로 |
| `--patterns <list>` | 모든 패턴 | 쉼표 구분 패턴 목록 (`missing-tenant-filter,password-logging`) |
| `--tsconfig <path>` | `tsconfig.json` | TypeScript 설정 파일 경로 |
| `--no-color` | false | 출력에서 색상 제거 |
| `--quiet` | false | 이슈만 출력, 요약 생략 |

#### 예시

```bash
# 기본 스캔
npx nestjs-leak-guard scan ./src

# staged 파일만, HIGH 발견 시 exit 1
npx nestjs-leak-guard scan --staged --fail-on=high

# JSON 출력으로 CI 파이프라인에서 파싱
npx nestjs-leak-guard scan ./src --output=json > results.json

# SARIF 출력 (GitHub Security 탭 통합)
npx nestjs-leak-guard scan ./src --output=sarif > leak-guard.sarif

# 특정 패턴만
npx nestjs-leak-guard scan ./src --patterns=password-logging,raw-query-with-input
```

### `--version`

```bash
npx nestjs-leak-guard --version
```

---

## 2. 설정 파일 (`.leak-guard.json`)

프로젝트 루트에 배치. 없으면 기본값 사용.

```json
{
  "rules": {
    "missing-tenant-filter": "error",
    "raw-query-with-input": "error",
    "password-logging": "error",
    "env-logging": "error",
    "public-on-sensitive-endpoint": "warn",
    "cross-tenant-id-passing": "warn",
    "enum-modify-existing": "warn",
    "column-drop-with-data": "warn"
  },
  "tenantShield": false,
  "tenantShieldImport": "nestjs-tenant-shield",
  "tenantIdField": "tenantId",
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/node_modules/**",
    "**/dist/**"
  ],
  "tsconfig": "tsconfig.json"
}
```

### `rules` 레벨

| 레벨 | 동작 |
|---|---|
| `"error"` | HIGH로 분류, `--fail-on=high` 시 exit 1 |
| `"warn"` | MEDIUM으로 분류, 기본 설정에서 exit 0 |
| `"off"` | 해당 패턴 검사 비활성화 |

### `tenantShield`

`true`로 설정 시:
- `package.json`에서 `nestjs-tenant-shield` 감지 시 자동 활성화
- `@RequireTenant()` 적용 메서드 → `missing-tenant-filter` skip
- `tenantShieldImport` 설정으로 커스텀 패키지명 지원

---

## 3. 출력 포맷

### text (기본)

```
🔍 Scanning ./src... (42 files)

⚠️  3 issues found

[HIGH] src/students/students.service.ts:42:5
  Pattern: missing-tenant-filter
  Code:    return this.repo.find();
  Risk:    Cross-tenant data leak — all tenants' data may be returned
  Fix:     Add WHERE tenantId condition or use @RequireTenant() from nestjs-tenant-shield
  Docs:    https://github.com/jinyeong-jung/nestjs-leak-guard/wiki/missing-tenant-filter

[HIGH] src/auth/auth.service.ts:67:5
  Pattern: password-logging
  Code:    console.log(`Login: ${user.password}`)
  Risk:    Credential exposure in logs
  Fix:     Never log password fields. Use a maskSensitive() helper.

[MEDIUM] migrations/025_add_leave_enum.sql:8:1
  Pattern: enum-modify-existing
  Code:    MODIFY status ENUM('present', 'absent', 'leave')
  Risk:    Existing rows with removed values may be silently affected
  Fix:     Add new column separately; migrate data; drop old column

──────────────────────────────────────────────
  HIGH: 2   MEDIUM: 1   LOW: 0
  Exit: 1 (--fail-on=high)
```

### json

```json
{
  "summary": {
    "files": 42,
    "issues": 3,
    "high": 2,
    "medium": 1,
    "low": 0
  },
  "results": [
    {
      "file": "src/students/students.service.ts",
      "line": 42,
      "column": 5,
      "pattern": "missing-tenant-filter",
      "level": "high",
      "message": "Repository.find() called without tenantId filter",
      "code": "return this.repo.find();",
      "suggestion": "Add WHERE tenantId condition or use @RequireTenant() from nestjs-tenant-shield",
      "docsUrl": "https://github.com/jinyeong-jung/nestjs-leak-guard/wiki/missing-tenant-filter"
    }
  ]
}
```

### sarif

SARIF 2.1.0 스펙. GitHub Actions Security 탭에 자동 통합됩니다.

---

## 4. TypeScript 인터페이스

```typescript
// 스캔 결과 단위
interface ScanResult {
  file: string;
  line: number;
  column: number;
  pattern: PatternId;
  level: 'high' | 'medium' | 'low';
  message: string;
  code: string;           // 문제가 있는 코드 스니펫
  suggestion: string;     // 수정 방법
  docsUrl: string;
}

// 패턴 ID
type PatternId =
  | 'missing-tenant-filter'
  | 'raw-query-with-input'
  | 'password-logging'
  | 'env-logging'
  | 'public-on-sensitive-endpoint'
  | 'cross-tenant-id-passing'
  | 'enum-modify-existing'
  | 'column-drop-with-data';

// 스캔 옵션 (CLI 옵션 파싱 결과)
interface ScanOptions {
  path: string;
  staged: boolean;
  failOn: 'high' | 'medium' | 'low' | 'none';
  output: 'text' | 'json' | 'sarif' | 'markdown';
  config?: string;
  patterns?: PatternId[];
  tsconfig?: string;
  quiet: boolean;
}

// 설정 파일 스키마
interface LeakGuardConfig {
  rules: Partial<Record<PatternId, 'error' | 'warn' | 'off'>>;
  tenantShield: boolean;
  tenantShieldImport: string;
  tenantIdField: string;
  exclude: string[];
  tsconfig: string;
}
```

---

## 5. 패턴 상세

### P1 — 데이터 누출 (High)

#### `missing-tenant-filter`

**감지 조건**:
- TypeORM: `this.repo.find()` / `findOne()` / `findBy()` / `count()` 호출
- 해당 메서드에 `where: { <tenantIdField>: ... }` 없음
- 해당 클래스/메서드에 `@RequireTenant()` 없음 (tenantShield: true 시)

**통과 조건**:
- `where: { tenantId: ... }` 직접 명시
- `@RequireTenant()` 적용 (tenantShield: true)
- `// nestjs-leak-guard-disable-next-line missing-tenant-filter` 마커

---

#### `raw-query-with-input`

**감지 조건**:
- `repo.query(\`...\`)` / `dataSource.query(\`...\`)` 호출
- 템플릿 리터럴 안에 변수 보간(`${...}`) 사용

**통과 조건**:
- 파라미터화 쿼리: `repo.query('SELECT ... WHERE id = ?', [id])`
- 상수 문자열만 사용 (보간 없음)

---

#### `password-logging`

**감지 조건**:
- `console.log` / `console.error` / `this.logger.log` 등 로깅 호출
- 인자에 `password`, `pwd`, `passwd`, `secret`, `token`, `apiKey`, `privateKey` 등 민감 필드명 포함

**통과 조건**:
- `// nestjs-leak-guard-disable-next-line password-logging` 마커

---

### P2 — 인증 우회 (Medium)

#### `public-on-sensitive-endpoint`

**감지 조건**:
- `@Public()` 데코레이터 + `@Post` / `@Delete` / `@Patch` 조합
- 경로에 `admin`, `delete`, `remove`, `purge`, `truncate` 포함

---

#### `env-logging`

**감지 조건**:
- 로깅 호출 인자에 `process.env.*` 포함

---

### P3 — 데이터 무결성 (Medium)

#### `enum-modify-existing`

**감지 조건** (SQL 파일):
- `MODIFY COLUMN ... ENUM(...)` 또는 `ALTER COLUMN ... TYPE ... ENUM`
- 기존 ENUM 값 목록에서 항목이 **제거**됨

---

#### `column-drop-with-data`

**감지 조건** (SQL 파일):
- `ALTER TABLE ... DROP COLUMN ...`
- 주석이나 마커 없이 단독 실행

---

## 6. 검사 제외 마커

```typescript
// 라인 단위 제외
// nestjs-leak-guard-disable-next-line <pattern-id>
this.repo.find();  // 이 줄만 제외

// 블록 단위 제외
// nestjs-leak-guard-disable missing-tenant-filter
async systemScan() {
  return this.repo.find(); // tenant 없이 전체 스캔 (시스템 작업)
}
// nestjs-leak-guard-enable missing-tenant-filter

// 파일 전체 제외
// nestjs-leak-guard-disable
```

---

## 7. ESLint 플러그인 (v0.3)

```bash
npm install --save-dev eslint-plugin-nestjs-leak-guard
```

```json
// .eslintrc.json
{
  "plugins": ["nestjs-leak-guard"],
  "rules": {
    "nestjs-leak-guard/missing-tenant-filter": "error",
    "nestjs-leak-guard/raw-query-with-input": "error",
    "nestjs-leak-guard/password-logging": "warn"
  }
}
```

CLI와 ESLint 플러그인은 동일한 패턴 로직을 공유합니다.

---

## 8. 변경 이력

| 버전 | 일자 | 변경 |
|---|---|---|
| v0.1 | 2026-06-05 | 초안 작성. CLI 옵션, 설정 파일, 출력 포맷, 패턴 5개 상세 정의. |
