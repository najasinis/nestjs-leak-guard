import { BasePattern } from '../base';
import type { PatternContext, ScanResult } from '../../types';

export class ColumnDropWithDataPattern extends BasePattern {
  readonly id = 'column-drop-with-data' as const;
  readonly level = 'medium' as const;
  readonly description = 'DROP COLUMN is irreversible — ensure column has no important data';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.rawContent) return [];
    if (!context.filePath.endsWith('.sql')) return [];

    const lines = context.rawContent.split('\n');
    const results: ScanResult[] = [];

    for (let i = 0; i < lines.length; i++) {
      const upper = lines[i].toUpperCase();
      const lineNum = i + 1;

      if (
        upper.includes('ALTER') &&
        upper.includes('TABLE') &&
        upper.includes('DROP') &&
        upper.includes('COLUMN')
      ) {
        // Allow if previous line explicitly confirms the column is empty
        const prevLine = i > 0 ? lines[i - 1].toLowerCase() : '';
        if (prevLine.includes('confirmed empty') || prevLine.includes('no data')) continue;

        results.push(this.makeResult(
          context.filePath, lineNum, 1,
          'DROP COLUMN is irreversible — ensure column has no important data',
          lines[i].trim().slice(0, 120),
          'Verify the column is empty. Consider nullable soft-delete first, drop later.',
        ));
      }
    }

    return results;
  }
}
