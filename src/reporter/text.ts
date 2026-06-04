import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

/**
 * 사람이 읽기 좋은 컬러 텍스트 출력.
 *
 * 예시:
 *   [HIGH] src/students/students.service.ts:42
 *     Pattern:    missing-tenant-filter
 *     Code:       return this.repo.find();
 *     Risk:       Cross-tenant data leak
 *     Fix:        Add { where: { tenantId } } or use @RequireTenant()
 */
export class TextReporter implements Reporter {
  constructor(
    private readonly noColor: boolean = false,
    private readonly quiet: boolean = false,
  ) {}

  report(results: ScanResult[], summary: ScanSummary): void {
    // TODO: 파일 경로 기준으로 정렬
    // TODO: HIGH → MEDIUM → LOW 순서로 출력
    // TODO: chalk로 등급별 색상 적용 (noColor 시 비활성)
    // TODO: quiet 아니면 summary 출력
    throw new Error('TextReporter.report: not implemented');
  }

  private formatResult(result: ScanResult): string {
    // TODO: 등급, 파일, 라인, 패턴, 코드, 수정 제안 포맷
    throw new Error('not implemented');
  }

  private formatSummary(summary: ScanSummary): string {
    // TODO: HIGH/MEDIUM/LOW 카운트 + duration + exit code 힌트
    throw new Error('not implemented');
  }
}
