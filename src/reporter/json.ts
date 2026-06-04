import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

/**
 * JSON 출력 — CI 파이프라인에서 프로그래매틱하게 파싱할 때 사용.
 *
 * 스키마:
 *   { "summary": ScanSummary, "results": ScanResult[] }
 */
export class JsonReporter implements Reporter {
  report(results: ScanResult[], summary: ScanSummary): void {
    // TODO: JSON.stringify({ summary, results }, null, 2) → stdout
    throw new Error('JsonReporter.report: not implemented');
  }
}
