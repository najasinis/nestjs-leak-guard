import { glob } from 'glob';
import * as path from 'path';
import type { LeakGuardConfig } from '../types';

const ALWAYS_IGNORE = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

/**
 * 지정 경로 하위의 스캔 대상 파일 목록 수집.
 */
export async function collectFilesFromPath(
  scanPath: string,
  config: LeakGuardConfig,
): Promise<string[]> {
  const absolutePath = path.resolve(scanPath);
  const files = await glob(`${absolutePath}/**/*.{ts,sql}`, {
    ignore: [...ALWAYS_IGNORE, ...config.exclude],
    absolute: true,
    nodir: true,
  });
  return files.sort();
}

/**
 * 단일 파일이 config.exclude 패턴에 해당하는지 확인.
 */
export function isExcluded(filePath: string, excludePatterns: string[]): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const patterns = [...ALWAYS_IGNORE, ...excludePatterns];
  return patterns.some((pattern) => matchGlob(normalized, pattern.replace(/\\/g, '/')));
}

function matchGlob(filePath: string, pattern: string): boolean {
  let re = '';
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === '*' && i + 1 < pattern.length && pattern[i + 1] === '*') {
      re += '.*';
      i += 2;
      if (i < pattern.length && pattern[i] === '/') {
        i++; // consume — .* already covers separators
      }
    } else if (ch === '*') {
      re += '[^/]*';
      i++;
    } else if (ch === '?') {
      re += '[^/]';
      i++;
    } else if (/[.+^${}()|[\]\\]/.test(ch)) {
      re += '\\' + ch;
      i++;
    } else {
      re += ch;
      i++;
    }
  }
  return new RegExp(`(^|/)${re}(/.*)?$`).test(filePath);
}
