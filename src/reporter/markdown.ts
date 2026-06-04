import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

/**
 * Markdown 출력 — PR 코멘트 또는 리포트 문서 생성용.
 *
 * 예시:
 *   ## nestjs-leak-guard Scan Results
 *   | Level | File | Line | Pattern | Fix |
 *   |-------|------|------|---------|-----|
 *   | 🔴 HIGH | src/students/... | 42 | missing-tenant-filter | ... |
 */
export class MarkdownReporter implements Reporter {
  report(results: ScanResult[], summary: ScanSummary): void {
    // TODO: 헤더 + 요약 테이블 + 상세 결과 테이블 출력
    // TODO: 이슈 없으면 "✅ No issues found" 출력
    throw new Error('MarkdownReporter.report: not implemented');
  }
}
