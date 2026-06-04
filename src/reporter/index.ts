import type { ScanResult, ScanSummary, OutputFormat } from '../types';

/** 모든 리포터가 구현하는 인터페이스 */
export interface Reporter {
  report(results: ScanResult[], summary: ScanSummary): void;
}

/**
 * 출력 포맷에 따라 적절한 Reporter 인스턴스 반환.
 */
export function createReporter(format: OutputFormat, options?: { noColor?: boolean; quiet?: boolean }): Reporter {
  // TODO: switch(format) → TextReporter / JsonReporter / SarifReporter / MarkdownReporter
  throw new Error('createReporter: not implemented');
}
