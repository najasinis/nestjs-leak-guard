import { BasePattern } from '../base';
import type { PatternContext, ScanResult } from '../../types';

export class EnumModifyExistingPattern extends BasePattern {
  readonly id = 'enum-modify-existing' as const;
  readonly level = 'medium' as const;
  readonly description = 'ENUM modification may silently corrupt existing rows';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.rawContent) return [];
    if (!context.filePath.endsWith('.sql')) return [];

    const lines = context.rawContent.split('\n');
    const results: ScanResult[] = [];

    for (let i = 0; i < lines.length; i++) {
      const upper = lines[i].toUpperCase();
      const lineNum = i + 1;

      // MySQL: ALTER TABLE t MODIFY COLUMN status ENUM(...)
      if (upper.includes('MODIFY') && upper.includes('COLUMN') && upper.includes('ENUM')) {
        results.push(this.makeResult(
          context.filePath, lineNum, 1,
          'ENUM column modification may silently corrupt existing rows',
          lines[i].trim().slice(0, 120),
          'Add new column with updated ENUM, migrate data, then drop old column.',
        ));
        continue;
      }

      // PostgreSQL: ALTER TYPE ... (RENAME TO / DROP VALUE / RENAME VALUE)
      if (
        upper.includes('ALTER') &&
        upper.includes('TYPE') &&
        (upper.includes('RENAME') || upper.includes('DROP VALUE'))
      ) {
        results.push(this.makeResult(
          context.filePath, lineNum, 1,
          'ALTER TYPE modification may silently corrupt existing rows',
          lines[i].trim().slice(0, 120),
          'Create a new enum type, alter columns to use it, then drop the old type.',
        ));
      }
    }

    return results;
  }
}
