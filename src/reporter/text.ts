import chalk from 'chalk';
import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

export class TextReporter implements Reporter {
  constructor(
    private readonly noColor: boolean = false,
    private readonly quiet: boolean = false,
  ) {
    if (noColor) chalk.level = 0;
  }

  report(results: ScanResult[], summary: ScanSummary): void {
    const sorted = [...results].sort((a, b) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const diff = (order[a.level] ?? 3) - (order[b.level] ?? 3);
      return diff !== 0 ? diff : a.file.localeCompare(b.file);
    });

    for (const result of sorted) {
      process.stdout.write(this.formatResult(result) + '\n\n');
    }

    if (!this.quiet) {
      process.stdout.write(this.formatSummary(summary) + '\n');
    }
  }

  private formatResult(r: ScanResult): string {
    const badge =
      r.level === 'high'
        ? chalk.red.bold('[HIGH]')
        : r.level === 'medium'
          ? chalk.yellow.bold('[MEDIUM]')
          : chalk.blue.bold('[LOW]');

    const loc = chalk.cyan(`${r.file}:${r.line}:${r.column}`);

    return [
      `${badge} ${loc}`,
      `  Pattern:    ${chalk.white(r.pattern)}`,
      `  Message:    ${r.message}`,
      `  Code:       ${chalk.dim(r.code)}`,
      `  Fix:        ${chalk.green(r.suggestion)}`,
      `  Docs:       ${chalk.dim(r.docsUrl)}`,
    ].join('\n');
  }

  private formatSummary(s: ScanSummary): string {
    const parts: string[] = [];
    if (s.high > 0) parts.push(chalk.red.bold(`${s.high} high`));
    if (s.medium > 0) parts.push(chalk.yellow.bold(`${s.medium} medium`));
    if (s.low > 0) parts.push(chalk.blue(`${s.low} low`));

    const issueStr = parts.length > 0 ? parts.join(', ') : chalk.green('no issues');

    return [
      chalk.bold('─'.repeat(60)),
      `Scanned ${s.files} file${s.files !== 1 ? 's' : ''} in ${s.durationMs}ms`,
      `Found: ${issueStr}`,
    ].join('\n');
  }
}
