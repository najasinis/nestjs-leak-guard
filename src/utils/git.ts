import { execSync } from 'child_process';
import * as path from 'path';

/**
 * git diff --staged --name-only 로 staged 파일 목록 반환.
 * 절대 경로 배열. Git 레포가 아니거나 staged 파일이 없으면 [].
 */
export function getGitStagedFiles(cwd = process.cwd()): string[] {
  // TODO: execSync('git diff --staged --name-only', { cwd })
  // TODO: stdout을 줄 단위 split
  // TODO: 빈 줄 제거 + path.resolve(cwd, file) 절대 경로 변환
  // TODO: .ts 또는 .sql 확장자만 필터
  throw new Error('getGitStagedFiles: not implemented');
}

/**
 * 현재 디렉토리가 git 레포인지 확인.
 */
export function isGitRepo(cwd = process.cwd()): boolean {
  // TODO: execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' }) 성공 여부 확인
  throw new Error('isGitRepo: not implemented');
}
