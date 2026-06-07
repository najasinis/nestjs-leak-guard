import { Node, SyntaxKind, SourceFile, CallExpression } from 'ts-morph';
import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

export class MissingTenantFilterPattern extends BasePattern {
  readonly id = 'missing-tenant-filter' as const;
  readonly level = 'high' as const;
  readonly description = 'Repository query without tenantId filter — cross-tenant data leak risk';

  private static readonly DANGEROUS_METHODS = [
    'find', 'findOne', 'findBy', 'findOneBy',
    'findAndCount', 'findAndCountBy', 'count',
  ];

  private static readonly REPO_PATTERNS = [/repo$/i, /repository$/i];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.sourceFile) return [];

    const sourceFile = context.sourceFile as SourceFile;
    const results: ScanResult[] = [];
    const tenantIdField = context.config.tenantIdField;

    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      const expr = callExpr.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return;

      const methodName = expr.getName();
      if (!MissingTenantFilterPattern.DANGEROUS_METHODS.includes(methodName)) return;

      const objText = expr.getExpression().getText();
      if (!MissingTenantFilterPattern.REPO_PATTERNS.some((p) => p.test(objText))) return;

      if (context.config.tenantShield && this.hasRequireTenantDecorator(callExpr)) return;

      const args = callExpr.getArguments();
      let flagged = false;
      let hint = '';

      if (args.length === 0) {
        flagged = true;
        hint = `${methodName}() called without ${tenantIdField} filter`;
      } else if (!this.hasWhereWithTenantId(args[0], tenantIdField)) {
        flagged = true;
        hint = `${methodName}() options missing ${tenantIdField} in where clause`;
      }

      if (flagged) {
        const { line, col } = getLineCol(sourceFile, callExpr.getStart());
        results.push(this.makeResult(
          context.filePath, line, col,
          hint,
          callExpr.getText().slice(0, 120),
          `Add { where: { ${tenantIdField} } } or use @RequireTenant() with tenantShield`,
        ));
      }
    });

    return results;
  }

  private hasWhereWithTenantId(arg: Node, tenantIdField: string): boolean {
    if (!Node.isObjectLiteralExpression(arg)) return true; // can't verify — skip

    const whereProp = arg.getProperty('where');
    if (!whereProp) return false;

    if (Node.isPropertyAssignment(whereProp)) {
      const init = whereProp.getInitializer();
      if (!init) return false;
      if (Node.isObjectLiteralExpression(init)) {
        return init.getProperty(tenantIdField) !== undefined;
      }
      return true; // dynamic value — assume ok
    }

    if (Node.isShorthandPropertyAssignment(whereProp)) return true;

    return false;
  }

  private hasRequireTenantDecorator(callExpr: CallExpression): boolean {
    const classDecl = callExpr.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
    if (!classDecl) return false;

    if (classDecl.getDecorators().some((d) => d.getName() === 'RequireTenant')) return true;

    const methodDecl = callExpr.getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
    return methodDecl?.getDecorators().some((d) => d.getName() === 'RequireTenant') ?? false;
  }
}

function getLineCol(sourceFile: SourceFile, pos: number): { line: number; col: number } {
  const lc = sourceFile.compilerNode.getLineAndCharacterOfPosition(pos);
  return { line: lc.line + 1, col: lc.character + 1 };
}
