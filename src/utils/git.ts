import { execSync } from 'child_process';
import * as path from 'path';

/**
 * git diff --staged --name-only 로 staged 파일 목록 반환.
 * 절대 경로 배열. Git 레포가 아니거나 staged 파일이 없으면 [].
 */
export function getGitStagedFiles(cwd = process.cwd()): string[] {
  try {
    const output = execSync('git diff --staged --name-only', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return output
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0 && (f.endsWith('.ts') || f.endsWith('.sql')))
      .map((f) => path.resolve(cwd, f));
  } catch {
    return [];
  }
}

/**
 * 현재 디렉토리가 git 레포인지 확인.
 */
export function isGitRepo(cwd = process.cwd()): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
