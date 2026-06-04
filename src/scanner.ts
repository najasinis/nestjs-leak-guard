import type { ScanResult, ScanSummary, ScanOptions, LeakGuardConfig } from './types';

/**
 * 최상위 스캔 오케스트레이터.
 *
 * 흐름:
 *   1. 파일 목록 수집 (collectFiles)
 *   2. ts-morph Project 초기화
 *   3. 각 파일에 대해 활성화된 패턴 실행
 *   4. 결과 집계 후 { results, summary } 반환
 */
export async function scan(
  options: ScanOptions,
  config: LeakGuardConfig,
): Promise<{ results: ScanResult[]; summary: ScanSummary }> {
  // TODO: const files = await collectFiles(options, config)
  // TODO: const project = initTsMorphProject(config.tsconfig)
  // TODO: const patterns = getActivePatterns(config, options.patterns)
  // TODO: for each file → for each pattern → analyze → collect results
  // TODO: filter results by config.rules (skip 'off' patterns)
  // TODO: return { results, summary: buildSummary(results, files.length, elapsed) }
  throw new Error('scan: not implemented');
}

/**
 * 스캔 대상 파일 목록 수집.
 *
 * options.staged === true → git diff --staged --name-only 파일만
 * 그 외                  → options.path 하위 .ts + .sql 파일 (glob)
 * config.exclude 패턴에 해당하는 파일은 제외.
 */
export async function collectFiles(
  options: ScanOptions,
  config: LeakGuardConfig,
): Promise<string[]> {
  // TODO: staged 모드면 getGitStagedFiles() 호출
  // TODO: 아니면 glob(options.path + '/**/*.{ts,sql}') 호출
  // TODO: config.exclude 패턴으로 필터링
  // TODO: 절대 경로 배열 반환
  throw new Error('collectFiles: not implemented');
}

/**
 * 결과 배열로부터 ScanSummary 생성.
 */
export function buildSummary(
  results: ScanResult[],
  fileCount: number,
  durationMs: number,
): ScanSummary {
  // TODO: high/medium/low 카운트 집계
  throw new Error('buildSummary: not implemented');
}

/**
 * 특정 등급 이상의 결과가 있는지 확인. CLI exit code 결정에 사용.
 */
export function shouldFail(
  summary: ScanSummary,
  failOn: ScanOptions['failOn'],
): boolean {
  // 'none' → 항상 false
  // 'high' → summary.high > 0
  // 'medium' → summary.high + summary.medium > 0
  // 'low' → summary.issues > 0
  throw new Error('shouldFail: not implemented');
}
