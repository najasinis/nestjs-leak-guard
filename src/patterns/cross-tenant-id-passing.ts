import { Node, SyntaxKind, SourceFile } from 'ts-morph';
import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

export class CrossTenantIdPassingPattern extends BasePattern {
  readonly id = 'cross-tenant-id-passing' as const;
  readonly level = 'medium' as const;
  readonly description = 'User-supplied tenantId used directly in query — tenant spoofing risk';

  // Patterns that indicate a value came from user-controlled input
  private static readonly USER_INPUT_PATTERN =
    /\b(query|body|params|dto|req\.query|req\.body|request\.query|request\.body)\b/;

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.sourceFile) return [];

    const sourceFile = context.sourceFile as SourceFile;
    const results: ScanResult[] = [];
    const tenantIdField = context.config.tenantIdField;

    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      const expr = callExpr.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return;

      const methodName = expr.getName();
      if (!['find', 'findOne', 'findBy', 'findOneBy', 'count', 'findAndCount'].includes(methodName))
        return;

      const args = callExpr.getArguments();
      if (args.length === 0 || !Node.isObjectLiteralExpression(args[0])) return;

      const whereProp = args[0].getProperty('where');
      if (!whereProp || !Node.isPropertyAssignment(whereProp)) return;

      const whereVal = whereProp.getInitializer();
      if (!whereVal || !Node.isObjectLiteralExpression(whereVal)) return;

      const tenantProp = whereVal.getProperty(tenantIdField);
      if (!tenantProp || !Node.isPropertyAssignment(tenantProp)) return;

      const tenantVal = tenantProp.getInitializer();
      if (!tenantVal) return;

      const valText = tenantVal.getText();
      if (!CrossTenantIdPassingPattern.USER_INPUT_PATTERN.test(valText)) return;

      const lc = sourceFile.compilerNode.getLineAndCharacterOfPosition(callExpr.getStart());
      results.push(this.makeResult(
        context.filePath,
        lc.line + 1,
        lc.character + 1,
        `User-supplied ${tenantIdField} used directly in query — tenant spoofing risk`,
        callExpr.getText().slice(0, 120),
        `Use getCurrentTenantId() from nestjs-tenant-shield instead of accepting ${tenantIdField} from user input.`,
      ));
    });

    return results;
  }
}
