import { glob } from 'glob';
import * as path from 'path';
import type { LeakGuardConfig } from '../types';

/**
 * 지정 경로 하위의 스캔 대상 파일 목록 수집.
 *
 * - .ts 파일 (테스트 파일은 config.exclude로 제외)
 * - .sql 파일 (마이그레이션 분석용)
 * - node_modules, dist 등 항상 제외
 */
export async function collectFilesFromPath(
  scanPath: string,
  config: LeakGuardConfig,
): Promise<string[]> {
  // TODO: glob(`${scanPath}/**/*.{ts,sql}`) 실행
  // TODO: config.exclude 패턴 → micromatch 또는 glob의 ignore 옵션으로 필터
  // TODO: 항상 제외: node_modules/, dist/, .git/
  // TODO: 절대 경로 배열 반환
  throw new Error('collectFilesFromPath: not implemented');
}

/**
 * 단일 파일이 config.exclude 패턴에 해당하는지 확인.
 */
export function isExcluded(filePath: string, excludePatterns: string[]): boolean {
  // TODO: micromatch(filePath, excludePatterns) 또는 minimatch 사용
  throw new Error('isExcluded: not implemented');
}
