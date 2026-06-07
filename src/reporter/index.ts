import type { ScanResult, ScanSummary, OutputFormat } from '../types';
import { TextReporter } from './text';
import { JsonReporter } from './json';
import { SarifReporter } from './sarif';
import { MarkdownReporter } from './markdown';

export interface Reporter {
  report(results: ScanResult[], summary: ScanSummary): void;
}

export function createReporter(
  format: OutputFormat,
  options?: { noColor?: boolean; quiet?: boolean },
): Reporter {
  switch (format) {
    case 'json':     return new JsonReporter();
    case 'sarif':    return new SarifReporter();
    case 'markdown': return new MarkdownReporter();
    case 'text':
    default:
      return new TextReporter(options?.noColor, options?.quiet);
  }
}
