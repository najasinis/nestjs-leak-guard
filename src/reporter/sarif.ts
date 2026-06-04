import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

/**
 * SARIF 2.1.0 출력 — GitHub Actions Security 탭 통합용.
 *
 * 구조:
 *   {
 *     "$schema": "...",
 *     "version": "2.1.0",
 *     "runs": [{
 *       "tool": { "driver": { "name": "nestjs-leak-guard", "rules": [...] } },
 *       "results": [...]
 *     }]
 *   }
 */
export class SarifReporter implements Reporter {
  report(results: ScanResult[], summary: ScanSummary): void {
    // TODO: ScanResult[] → SARIF result 객체 배열 변환
    //   - level: 'high' → 'error', 'medium' → 'warning', 'low' → 'note'
    //   - location: artifactLocation.uri + region.startLine
    //   - message.text = result.message
    // TODO: 각 패턴 ID → rules 배열 (id, name, helpUri, shortDescription)
    // TODO: JSON.stringify(sarifDoc) → stdout
    throw new Error('SarifReporter.report: not implemented');
  }
}
