import { Node, SyntaxKind, SourceFile } from 'ts-morph';
import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

export class RawQueryWithInputPattern extends BasePattern {
  readonly id = 'raw-query-with-input' as const;
  readonly level = 'high' as const;
  readonly description = 'Raw SQL with string interpolation — SQL injection risk';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.sourceFile) return [];

    const sourceFile = context.sourceFile as SourceFile;
    const results: ScanResult[] = [];

    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      const expr = callExpr.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return;
      if (expr.getName() !== 'query') return;

      const args = callExpr.getArguments();
      if (args.length === 0) return;

      // TemplateExpression = `...${var}...` — dangerous
      // NoSubstitutionTemplateLiteral = `...` — safe
      if (!Node.isTemplateExpression(args[0])) return;

      const lc = sourceFile.compilerNode.getLineAndCharacterOfPosition(callExpr.getStart());
      results.push(this.makeResult(
        context.filePath,
        lc.line + 1,
        lc.character + 1,
        'Raw SQL with string interpolation — SQL injection risk',
        args[0].getText().slice(0, 120),
        "Use parameterized query: repo.query('SELECT ... WHERE id = ?', [id])",
      ));
    });

    return results;
  }
}
