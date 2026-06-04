# nestjs-leak-guard — PRD

> 작성일: 2026-06-01  
> 버전: v0.1 (초안)  
> 라이선스: MIT  
> 패키지명: `nestjs-leak-guard` (npm 가용성 6/7 검증 예정)  
> 상태: 후보 풀 (6/7 결정 시 비교용)  
> 관련: nestjs-tenant-shield와 Defense in Depth 2층 형성  

---

## 0. 한 줄 요약

NestJS 코드를 자동 스캔해서 **데이터 누출 위험 패턴을 코드 작성 시점에 미리 알려주는 정적 분석 도구**.

핵심 4가지:
- **작성 시점 발견**: git commit 직전 위험 자동 감지
- **NestJS 특화 패턴**: 일반 ESLint 룰로 못 잡는 NestJS 특유의 위험
- **AI 코딩 시대 검증**: Cursor/Claude Code가 짠 코드 안전 자동 검증
- **tenant-shield 시너지**: Static defense + Runtime defense 결합

---

## 1. 왜 만드는가

### 1.1 풀려는 문제

AI 코딩 시대에 데이터 누출 사고가 늘어남. 인간이 쓴 코드도 동일.

#### 실제 사고 시나리오

```typescript
// 시나리오 1: tenant_id 빠뜨림 (가장 흔함)
async findAllStudents() {
  return this.repo.find();  // ← 다른 회사 학생까지 나옴
}

// 시나리오 2: raw query에 사용자 입력 직접 결합
async search(name: string) {
  return this.repo.query(`SELECT * FROM students WHERE name = '${name}'`);
  // ← SQL injection
}

// 시나리오 3: 민감 정보 로깅
async login(user: User) {
  console.log(`Login attempt: ${user.password}`);  // ← 비밀번호 로깅
}

// 시나리오 4: 마이그레이션 데이터 손실 (실제 사고 사례)
// 025_add_leave_enum.sql
ALTER TABLE attendance MODIFY status ENUM('present', 'absent', 'leave');
// ← 기존 'present', 'late' 데이터가 의도와 다르게 처리됨
```

이런 위험을 **git commit 직전에 자동 감지**.

### 1.2 시장 조사 - 빈자리 검증

**기존 도구**:
- ESLint + @typescript-eslint: 일반 TypeScript 룰만
- SonarQube/Snyk: 일반 보안 룰. NestJS 특화 X
- ESLint NestJS 플러그인 (eslint-plugin-nestjs): 코드 스타일 위주, 데이터 누출 검사 X
- Semgrep: 강력하지만 룰 직접 작성 필요

**진짜 빈자리**:
- NestJS 특화 데이터 누출 패턴 자동 감지 → 없음
- TypeORM/Prisma 쿼리에 tenant_id 누락 자동 감지 → 없음
- "AI 코딩 시대 검증" 포지셔닝 → 없음

### 1.3 차별화

| 기능 | ESLint | SonarQube | Semgrep | nestjs-leak-guard |
|---|---|---|---|---|
| NestJS 특화 패턴 | ❌ | ❌ | 룰 직접 작성 | ✅ |
| tenant_id 누락 감지 | ❌ | ❌ | 직접 작성 | ✅ |
| 마이그레이션 위험 감지 | ❌ | 부분 | 직접 작성 | ✅ |
| AI 코딩 검증 메시지 | ❌ | ❌ | ❌ | ✅ |
| 무료 + 오픈소스 | ✅ | 부분 | ✅ | ✅ (MIT) |

---

## 2. 핵심 개념

### 2.1 비유: 식당의 위생 검사관

```
일반 검사 (ESLint):
  주방 청결도 확인 ✓
  손 씻기 확인 ✓
  → 일반 위생만 봄

NestJS 위생 검사관 (nestjs-leak-guard):
  학원 데이터 격리 확인
  민감 정보 로깅 확인
  마이그레이션 안전성 확인
  → 도메인 특화 위험 봄
```

### 2.2 Static vs Runtime 검증

```
[Static - 코드 작성 시점]
  nestjs-leak-guard
        ↓
  AST 분석 → 위험 패턴 감지 → 사전 차단
  
[Runtime - 실행 시점]
  nestjs-tenant-shield
        ↓
  쿼리 실행 시 자동 WHERE 주입 → 사후 차단

두 라이브러리 같이 쓰면 Defense in Depth
```

### 2.3 Defense in Depth (다층 방어)

```
1층: 코드 작성 시점 (nestjs-leak-guard)
  → AI가 짠 코드, git commit 전 검증
  
2층: 실행 시점 (nestjs-tenant-shield)
  → 통과한 코드도 런타임 격리
  
3층: DB 레벨 (Postgres RLS)
  → 마지막 자물쇠
  
한 층 뚫려도 다음 층에서 차단
```

---

## 3. 사용 시나리오

### 3.1 설치

```bash
npm install --save-dev nestjs-leak-guard
```

### 3.2 CLI 일회성 실행

```bash
npx nestjs-leak-guard scan ./src
```

출력 예:
```
🔍 Scanning ./src...

⚠️ 3 issues found

[HIGH] src/students/students.service.ts:42
  Pattern: missing-tenant-filter
  Code: this.repo.find()
  → Risk: cross-tenant data leak
  → Suggestion: use nestjs-tenant-shield's @RequireTenant() or add WHERE tenantId
  → Docs: https://github.com/jinyeong-jung/nestjs-leak-guard/docs/missing-tenant-filter

[HIGH] src/auth/auth.service.ts:67
  Pattern: password-logging
  Code: console.log(`Login: ${user.password}`)
  → Risk: credential exposure
  → Suggestion: never log password fields; use a maskPassword() helper

[MEDIUM] src/migrations/025_add_leave_enum.sql:8
  Pattern: enum-modify-existing
  Code: MODIFY COLUMN status ENUM('present', 'absent', 'leave')
  → Risk: existing rows may be silently affected
  → Suggestion: split into a separate column (e.g., left_at TIMESTAMP)
```

### 3.3 pre-commit hook

```bash
# .husky/pre-commit
#!/bin/sh
npx nestjs-leak-guard scan --staged --fail-on=high
```

→ HIGH 위험 발견 시 commit 차단

### 3.4 GitHub Actions

```yaml
# .github/workflows/security.yml
name: Leak Guard

on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx nestjs-leak-guard scan ./src --fail-on=high --output=sarif
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: leak-guard.sarif
```

### 3.5 IDE 통합 (v0.2)

VS Code 확장으로 실시간 표시.

---

## 4. 검사 패턴 (v0.1 기준)

### 4.1 P1 - 데이터 누출 (High Risk)

#### Pattern: `missing-tenant-filter`

```typescript
// ❌ 감지
async findAll() {
  return this.repo.find();
}

// ✅ 통과
async findAll(tenantId: string) {
  return this.repo.find({ where: { tenantId } });
}

// ✅ 통과 (nestjs-tenant-shield 사용)
@RequireTenant()
async findAll() {
  return this.repo.find();
}
```

#### Pattern: `cross-tenant-id-passing`

```typescript
// ❌ 감지: 다른 곳에서 받은 tenantId를 그대로 사용
async findStudent(query: any) {
  return this.repo.find({ where: { tenantId: query.tenantId } });
  // 사용자 입력 변조 위험
}
```

### 4.2 P2 - SQL Injection

#### Pattern: `raw-query-with-input`

```typescript
// ❌ 감지
async search(name: string) {
  return this.repo.query(`SELECT * FROM students WHERE name = '${name}'`);
}

// ✅ 통과 (파라미터화)
async search(name: string) {
  return this.repo.query('SELECT * FROM students WHERE name = ?', [name]);
}
```

### 4.3 P3 - 민감 정보 노출

#### Pattern: `password-logging`

```typescript
// ❌ 감지
console.log(user.password);
this.logger.info(`Password: ${pwd}`);
```

#### Pattern: `env-logging`

```typescript
// ❌ 감지
console.log(process.env.AWS_SECRET_KEY);
```

### 4.4 P4 - 인증 우회

#### Pattern: `public-on-sensitive-endpoint`

```typescript
// ❌ 감지: @Public()과 민감 액션 조합
@Public()
@Post('admin/delete-all')
async dangerous() { ... }
```

### 4.5 P5 - 데이터 무결성

#### Pattern: `enum-modify-existing`

```sql
-- ❌ 감지
ALTER TABLE attendance MODIFY status ENUM('a', 'b', 'leave');

-- ✅ 통과 (별도 컬럼)
ALTER TABLE attendance ADD COLUMN left_at TIMESTAMP NULL;
```

#### Pattern: `column-drop-with-data`

```sql
-- ❌ 감지: 데이터 있는 컬럼 DROP
ALTER TABLE students DROP COLUMN important_field;
```

### 4.6 검사 결과 등급

- **HIGH**: 즉시 데이터 누출/보안 사고 가능
- **MEDIUM**: 운영 상황에 따라 사고 가능
- **LOW**: 코드 스타일 또는 잠재 위험

### 4.7 False Positive 최소화

각 패턴에 **검사 제외 마커** 지원:

```typescript
// nestjs-leak-guard-disable-next-line missing-tenant-filter
async findAllSystem() {
  return this.repo.find();  // 시스템 작업이라 의도적
}
```

---

## 5. 설계 원칙

1. **NestJS 특화 (NestJS-Specific)**
   범용 ESLint 룰로 못 잡는 NestJS 특유의 패턴에 집중.

2. **False Positive 최소화 (Low FP)**
   사용자 이탈 1순위 원인. 마커 + 컨텍스트 분석으로 줄임.

3. **명확한 제안 (Clear Suggestions)**
   "이게 위험" 외에 "어떻게 고쳐야 함" 같이 제공.

4. **점진적 적용 (Progressive)**
   기존 코드에 일괄 적용 강제 X. 새 코드부터 적용 가능한 모드 제공.

5. **tenant-shield 시너지**
   tenant-shield 사용 시 검사 패턴 자동 조정 (이미 보호되는 코드는 skip).

---

## 6. 제품 개요

| 항목 | 내용 |
|---|---|
| 이름 | nestjs-leak-guard |
| 한 줄 요약 | NestJS 코드 데이터 누출 위험 정적 분석 |
| 목적 | 코드 작성 시점에 데이터 누출/보안 위험 자동 감지 |
| 타겟 | NestJS 백엔드 개발자, 특히 AI 코딩 사용자 |
| 라이선스 | MIT |

---

## 7. 핵심 기능

### F-01 CLI 스캐너

```bash
npx nestjs-leak-guard scan [path] [options]
```

옵션:
- `--staged`: git staged 파일만
- `--fail-on=<level>`: 지정 등급 이상 발견 시 exit 1
- `--output=<format>`: text / json / sarif / markdown
- `--config=<file>`: 설정 파일 경로
- `--patterns=<list>`: 특정 패턴만 실행

### F-02 설정 파일 (`.leak-guard.json`)

```json
{
  "rules": {
    "missing-tenant-filter": "error",
    "raw-query-with-input": "error",
    "password-logging": "error",
    "enum-modify-existing": "warn"
  },
  "tenantShield": true,
  "exclude": ["**/*.test.ts", "**/migrations/*.sql"],
  "tenantIdField": "tenantId"
}
```

### F-03 AST 분석 엔진

- TypeScript Compiler API 기반
- NestJS 데코레이터 인식 (`@Injectable`, `@Controller`, `@RequireTenant`)
- TypeORM/Prisma 쿼리 패턴 인식

### F-04 ESLint 플러그인 (선택)

```bash
npm install --save-dev eslint-plugin-nestjs-leak-guard
```

```json
// .eslintrc
{
  "plugins": ["nestjs-leak-guard"],
  "rules": {
    "nestjs-leak-guard/missing-tenant-filter": "error"
  }
}
```

### F-05 SARIF 출력 (GitHub Security 통합)

GitHub Actions에서 Security 탭에 결과 자동 표시.

### F-06 tenant-shield 자동 감지

`package.json`에 nestjs-tenant-shield 발견 시:
- 이미 보호되는 메서드 (@RequireTenant 적용) skip
- tenant-shield 설정 읽어서 tenantIdField 자동 매칭

---

## 8. 데이터 모델

라이브러리 자체는 상태 저장 X. 모든 분석은 코드 AST 기반.

### 검사 결과 데이터 (출력)

```typescript
interface ScanResult {
  file: string;
  line: number;
  column: number;
  pattern: string;
  level: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  docsUrl: string;
}
```

---

## 9. 범위 제외 (v0.1)

1. VS Code 확장 → v0.2
2. JetBrains IDE 통합 → v0.3
3. AI 기반 패턴 학습 (사용자 코드 학습) → 영구 제외 (privacy)
4. 자동 수정 (auto-fix) → v0.2
5. 팀 단위 대시보드 → 백로그

---

## 10. 마일스톤

- v0.0.1 (Week 1): Foundation - CLI 구조, AST 분석 엔진 셋업
- v0.0.2 (Week 2): P1 패턴 3개 구현 (tenant filter, raw query, password log)
- v0.0.3 (Week 3): P2~P3 패턴 + 마이그레이션 SQL 분석
- v0.0.4 (Week 4): 설정 파일 + ESLint 플러그인 + tenant-shield 통합
- v0.0.5 (Week 5): SARIF 출력 + GitHub Actions 가이드 + False positive 줄이기
- v0.1.0 (Week 6): README 영문/한글 + npm publish + 공개

총 6주, 매일 1시간.

---

## 11. 위험 및 한계

### 11.1 False Positive

가장 큰 위험. 잘못 잡으면 사용자 즉시 이탈.

**완화책**:
- 각 패턴에 검사 제외 마커 지원
- 컨텍스트 분석 (tenant-shield 사용 시 skip 등)
- 베타 1개월 운영하며 FP 줄이기

### 11.2 ESLint 플러그인 시장 진입 장벽

`@typescript-eslint/eslint-plugin` 등 거대 플러그인 존재. 차별화 메시지 명확해야.

**완화책**:
- "NestJS 특화 + AI 코딩 검증" 포지셔닝
- 독립 CLI도 제공 (ESLint 플러그인 외 옵션)

### 11.3 TypeScript Compiler API 복잡도

AST 분석은 깊이 큼. 학습 시간 필요.

**완화책**: 단순한 패턴부터 시작, 점진 확장.

### 11.4 SQL 분석의 어려움

마이그레이션 SQL 분석은 SQL 파서 필요. node-sql-parser 사용 검토.

---

## 12. 의존성

**peer**:
- Node.js 18+
- TypeScript 4.7+

**dependencies**:
- typescript (peer로도 가능)
- commander (CLI)
- chalk (출력)
- node-sql-parser (마이그레이션 분석)

**optional**:
- eslint (플러그인 형태로 쓸 때)

---

## 13. 변경 이력

| 버전 | 일자 | 변경 |
|---|---|---|
| v0.1 | 2026-06-01 | 초안. nestjs-tenant-shield 후속 도구로 기획. |