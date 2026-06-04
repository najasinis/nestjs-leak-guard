# nestjs-leak-guard

[![npm version](https://badge.fury.io/js/nestjs-leak-guard.svg)](https://www.npmjs.com/package/nestjs-leak-guard)
[![CI](https://github.com/jinyeong-jung/nestjs-leak-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/jinyeong-jung/nestjs-leak-guard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Catch data-leak risks in NestJS code **before they reach production** — at commit time, not at incident time.

---

## 🌐 English

### What is this?

nestjs-leak-guard is a **static analysis CLI** that scans your NestJS TypeScript code for data-leak risk patterns:

- Missing `tenantId` filter in TypeORM/Prisma queries
- Raw SQL with string interpolation (SQL injection)
- Passwords/secrets accidentally logged
- `@Public()` on sensitive admin endpoints
- Dangerous SQL migration patterns (ENUM modification, column drop)

It's the **static defense layer** that pairs with [nestjs-tenant-shield](https://github.com/jinyeong-jung/nestjs-tenant-shield) (runtime defense) for Defense in Depth.

### Install

```bash
npm install --save-dev nestjs-leak-guard
```

### Quick Start

```bash
# Scan your src directory
npx nestjs-leak-guard scan ./src

# Block commits with HIGH issues
npx nestjs-leak-guard scan --staged --fail-on=high

# CI — output SARIF for GitHub Security tab
npx nestjs-leak-guard scan ./src --output=sarif > leak-guard.sarif
```

### Sample output

```
🔍 Scanning ./src... (42 files)

⚠️  2 issues found

[HIGH] src/students/students.service.ts:42
  Pattern: missing-tenant-filter
  Code:    return this.repo.find();
  Risk:    Cross-tenant data leak — all tenants' data may be returned
  Fix:     Add { where: { tenantId } } or use @RequireTenant() from nestjs-tenant-shield

[HIGH] src/auth/auth.service.ts:67
  Pattern: password-logging
  Code:    console.log(`Login: ${user.password}`)
  Risk:    Credential exposure in logs
  Fix:     Never log password fields. Use a maskSensitive() helper.

──────────────────────────────
  HIGH: 2   Exit: 1
```

### Pre-commit hook (Husky)

```bash
# .husky/pre-commit
npx nestjs-leak-guard scan --staged --fail-on=high
```

### GitHub Actions

```yaml
- name: Leak Guard Scan
  run: npx nestjs-leak-guard scan ./src --fail-on=high --output=sarif
  continue-on-error: true
- uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: leak-guard.sarif
```

### Suppress a false positive

```typescript
// nestjs-leak-guard-disable-next-line missing-tenant-filter
async findAllForCron() {
  return this.repo.find(); // intentional — system cron context
}
```

### Works with nestjs-tenant-shield

```json
// .leak-guard.json
{
  "tenantShield": true
}
```

When enabled, methods decorated with `@RequireTenant()` automatically skip the `missing-tenant-filter` check — no false positives.

### Honest Limits

nestjs-leak-guard performs **static analysis**. It cannot detect:
- Runtime-only issues (e.g., wrong tenantId passed at runtime)
- Patterns in dynamically generated code
- Issues inside `eval()` or `Function()` calls

For runtime protection, combine with [nestjs-tenant-shield](https://github.com/jinyeong-jung/nestjs-tenant-shield).

---

## 🇰🇷 한국어

### 왜 만들었나요?

AI 코딩(Cursor, Claude Code 등) 시대에 데이터 누출 사고가 늘어나고 있습니다. AI가 짠 코드도, 인간이 짠 코드도 같은 패턴에서 실수합니다:

```typescript
// 가장 흔한 실수: tenantId 빠뜨림
async findAllStudents() {
  return this.repo.find();  // ← 다른 회사 데이터까지 나옴
}

// SQL injection
async search(name: string) {
  return this.repo.query(`SELECT * FROM students WHERE name = '${name}'`);
}

// 비밀번호 로깅
async login(user: User) {
  console.log(`Login attempt: ${user.password}`);  // ← 로그에 비밀번호
}
```

nestjs-leak-guard는 이런 위험을 **git commit 직전에 자동 감지**합니다.

### 설치

```bash
npm install --save-dev nestjs-leak-guard
```

### 빠른 시작

```bash
# src 폴더 스캔
npx nestjs-leak-guard scan ./src

# staged 파일만 (pre-commit hook 용)
npx nestjs-leak-guard scan --staged --fail-on=high
```

### Defense in Depth (다층 방어)

```
1층: 코드 작성 시점 (nestjs-leak-guard)     ← 이 도구
  → AST 분석 → 위험 패턴 사전 감지

2층: 실행 시점 (nestjs-tenant-shield)
  → 쿼리 실행 시 자동 WHERE tenantId 주입

3층: DB 레벨 (Postgres RLS)
  → 마지막 자물쇠
```

한 층 뚫려도 다음 층에서 차단합니다.

### 검사 패턴 (v0.1)

| 패턴 | 등급 | 설명 |
|---|---|---|
| `missing-tenant-filter` | HIGH | TypeORM/Prisma 쿼리에 tenantId 없음 |
| `raw-query-with-input` | HIGH | raw SQL에 사용자 입력 직접 보간 |
| `password-logging` | HIGH | 비밀번호/시크릿 로깅 |
| `env-logging` | HIGH | process.env 민감값 로깅 |
| `public-on-sensitive-endpoint` | MEDIUM | @Public() + 민감 엔드포인트 조합 |
| `cross-tenant-id-passing` | MEDIUM | 사용자 입력 tenantId 직접 사용 |
| `enum-modify-existing` | MEDIUM | 마이그레이션에서 기존 ENUM 수정 |
| `column-drop-with-data` | MEDIUM | 데이터 있는 컬럼 DROP |

### 설정

```json
// .leak-guard.json
{
  "rules": {
    "missing-tenant-filter": "error",
    "raw-query-with-input": "error",
    "password-logging": "error",
    "enum-modify-existing": "warn"
  },
  "tenantShield": true,
  "exclude": ["**/*.spec.ts", "**/*.test.ts"]
}
```

---

## 📦 현재 상태

**v0.0.1 개발 중.** Foundation 단계 진행 중.

| 버전 | 내용 | 상태 |
|------|------|------|
| v0.0.x | CLI 구조 + AST 엔진 | ⏳ |
| v0.1.0 | P1 패턴 3개 + pre-commit + npm publish | 🔒 |
| v0.2.0 | P2~P3 패턴 + SARIF + GitHub Actions | 🔒 |

---

## 🤝 기여

이슈와 PR 환영합니다. 특히:
- False Positive 신고 (재현 코드와 함께)
- 새 패턴 제안 (실제 사고 사례 기반)

---

## 📜 라이선스

MIT © Jinyeong Jung

---

## 📚 문서

- [PRD](docs/leak-guard-PRD.md): 설계 배경/로드맵
- [API 명세](docs/leak-guard-api-spec.md): CLI 옵션, 출력 포맷, 패턴 상세
- [FAQ](docs/FAQ.md): 자주 묻는 질문
- [트러블슈팅](docs/troubleshooting.md): 알려진 문제와 해결법
- [CLAUDE.md](docs/CLAUDE.md): Claude Code 작업 규칙 (기여자용)
