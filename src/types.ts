// ─── 패턴 ID ───────────────────────────────────────────────────────────────
export type PatternId =
  | 'missing-tenant-filter'
  | 'raw-query-with-input'
  | 'password-logging'
  | 'env-logging'
  | 'public-on-sensitive-endpoint'
  | 'cross-tenant-id-passing'
  | 'enum-modify-existing'
  | 'column-drop-with-data';

// ─── 심각도 ────────────────────────────────────────────────────────────────
export type Severity = 'high' | 'medium' | 'low';

// ─── 출력 포맷 ─────────────────────────────────────────────────────────────
export type OutputFormat = 'text' | 'json' | 'sarif' | 'markdown';

// ─── 단일 스캔 결과 ────────────────────────────────────────────────────────
export interface ScanResult {
  file: string;       // 절대 경로
  line: number;       // 1-based
  column: number;     // 1-based
  pattern: PatternId;
  level: Severity;
  message: string;    // 한 줄 요약
  code: string;       // 문제 코드 스니펫
  suggestion: string; // 수정 방법 (코드 수준)
  docsUrl: string;
}

// ─── 스캔 요약 ─────────────────────────────────────────────────────────────
export interface ScanSummary {
  files: number;
  issues: number;
  high: number;
  medium: number;
  low: number;
  durationMs: number;
}

// ─── CLI 옵션 ──────────────────────────────────────────────────────────────
export interface ScanOptions {
  path: string;
  staged: boolean;
  failOn: Severity | 'none';
  output: OutputFormat;
  config?: string;
  patterns?: PatternId[];
  tsconfig?: string;
  quiet: boolean;
  noColor: boolean;
}

// ─── 설정 파일 스키마 (.leak-guard.json) ───────────────────────────────────
export type RuleLevel = 'error' | 'warn' | 'off';

export interface LeakGuardConfig {
  rules: Partial<Record<PatternId, RuleLevel>>;
  tenantShield: boolean;
  tenantShieldImport: string; // default: 'nestjs-tenant-shield'
  tenantIdField: string;      // default: 'tenantId'
  exclude: string[];          // glob patterns
  tsconfig: string;           // default: 'tsconfig.json'
}

// ─── 패턴 인터페이스 ───────────────────────────────────────────────────────
export interface Pattern {
  id: PatternId;
  level: Severity;           // 기본 등급 (config로 override 가능)
  description: string;
  analyze(context: PatternContext): ScanResult[];
}

// ─── 패턴 실행 컨텍스트 ────────────────────────────────────────────────────
export interface PatternContext {
  filePath: string;
  config: LeakGuardConfig;
  // ts-morph SourceFile — 패턴 구현에서 import해서 사용
  // SQL 파일일 경우 sourceFile이 undefined일 수 있음
  sourceFile?: unknown;
  rawContent?: string; // SQL 파일 분석용 원본 텍스트
}
