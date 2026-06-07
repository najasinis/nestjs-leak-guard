import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

export class JsonReporter implements Reporter {
  report(results: ScanResult[], summary: ScanSummary): void {
    process.stdout.write(JSON.stringify({ summary, results }, null, 2) + '\n');
  }
}
