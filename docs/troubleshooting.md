# 트러블슈팅 — nestjs-leak-guard

> 알려진 문제와 해결법.

---

## 1. 설치 / 실행 오류

### `Cannot find module 'ts-morph'`

```
Error: Cannot find module 'ts-morph'
```

**원인**: ts-morph가 설치되지 않음 (devDependency로 설치했는데 프로덕션 환경에서 실행).

**해결**:
```bash
npm install --save-dev nestjs-leak-guard
# --save-dev 없이 글로벌로 쓰려면:
npm install -g nestjs-leak-guard
```

---

### `Error: ENOENT: no such file or directory`

```
Error: ENOENT: no such file or directory, open './src'
```

**원인**: scan 경로가 존재하지 않음.

**해결**: 프로젝트 루트에서 실행하거나 정확한 경로 지정.
```bash
# 프로젝트 루트에서
npx nestjs-leak-guard scan ./src

# 또는 절대 경로
npx nestjs-leak-guard scan /path/to/project/src
```

---

### `TypeError: Cannot read properties of undefined (reading 'getSourceFiles')`

**원인**: `tsconfig.json`이 없거나 경로가 다름.

**해결**: `--tsconfig` 옵션으로 명시하거나, 프로젝트 루트에 `tsconfig.json`이 있는지 확인.
```bash
npx nestjs-leak-guard scan ./src --tsconfig ./tsconfig.build.json
```

---

## 2. False Positive 문제

### `missing-tenant-filter` 가 @RequireTenant() 메서드에서 감지됨

**원인**: `.leak-guard.json`에 `"tenantShield": true`가 설정되지 않았거나, `@RequireTenant`의 import 경로가 다름.

**해결**:
```json
// .leak-guard.json
{
  "tenantShield": true,
  "tenantShieldImport": "my-custom-shield-package"
}
```

또는 해당 라인에 마커 추가:
```typescript
// nestjs-leak-guard-disable-next-line missing-tenant-filter
async findAll() { ... }
```

---

### 테스트 파일에서 경고가 뜸

**원인**: 테스트 파일도 스캔 대상에 포함됨.

**해결**: `.leak-guard.json`에서 제외:
```json
{
  "exclude": ["**/*.spec.ts", "**/*.test.ts", "**/test/**"]
}
```

---

## 3. GitHub Actions 오류

### `Process completed with exit code 1` — SARIF 업로드 전 실패

**원인**: `--fail-on=high` 설정으로 HIGH 이슈 발견 시 exit 1. SARIF 업로드 스텝이 실행 안 됨.

**해결**: scan 스텝에 `continue-on-error: true` 추가.
```yaml
- name: Scan
  run: npx nestjs-leak-guard scan ./src --fail-on=high --output=sarif
  continue-on-error: true
- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: leak-guard.sarif
```

---

## 4. 설정 파일 오류

### `.leak-guard.json` 이 적용되지 않음

**원인**: 설정 파일 위치가 프로젝트 루트가 아님.

**해결**: 프로젝트 루트(package.json과 같은 위치)에 `.leak-guard.json` 배치.
또는 `--config` 옵션으로 경로 명시:
```bash
npx nestjs-leak-guard scan ./src --config ./config/leak-guard.json
```

---

## 5. 성능 문제

### 대형 프로젝트에서 스캔이 너무 느림

**해결 방법들**:
1. `--staged` 옵션으로 변경된 파일만 스캔
2. `.leak-guard.json`의 `exclude`로 node_modules, dist, 불필요한 폴더 제외
3. `--patterns` 옵션으로 꼭 필요한 패턴만 실행

```bash
# staged 파일만
npx nestjs-leak-guard scan --staged

# 특정 패턴만
npx nestjs-leak-guard scan ./src --patterns=password-logging,raw-query-with-input
```

---

## 6. 버그 리포트

위 방법으로 해결되지 않으면 GitHub Issue에 다음 정보와 함께 등록해 주세요:
- nestjs-leak-guard 버전 (`nestjs-leak-guard --version`)
- Node.js 버전 (`node -v`)
- TypeScript 버전 (`tsc -v`)
- `--output=json` 결과 (민감 정보 제거 후)
- 재현 가능한 최소 코드 스니펫
