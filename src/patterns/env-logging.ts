import { Node, SyntaxKind, SourceFile, CallExpression } from 'ts-morph';
import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

export class EnvLoggingPattern extends BasePattern {
  readonly id = 'env-logging' as const;
  readonly level = 'high' as const;
  readonly description = 'process.env variable passed to logger — potential secret exposure';

  private static readonly SAFE_ENV_VARS = new Set([
    'NODE_ENV', 'PORT', 'LOG_LEVEL', 'TZ', 'HOSTNAME',
  ]);

  private static readonly LOGGING_METHODS = ['log', 'error', 'warn', 'debug', 'verbose', 'info'];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.sourceFile) return [];

    const sourceFile = context.sourceFile as SourceFile;
    const results: ScanResult[] = [];

    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      if (!this.isLoggingCall(callExpr)) return;

      for (const arg of callExpr.getArguments()) {
        const envVar = this.findUnsafeEnvAccess(arg);
        if (envVar) {
          const lc = sourceFile.compilerNode.getLineAndCharacterOfPosition(callExpr.getStart());
          results.push(this.makeResult(
            context.filePath,
            lc.line + 1,
            lc.character + 1,
            `process.env.${envVar} logged directly — potential secret exposure`,
            callExpr.getText().slice(0, 120),
            'Avoid logging env vars directly. Log a boolean check or masked value instead.',
          ));
          break;
        }
      }
    });

    return results;
  }

  private isLoggingCall(callExpr: CallExpression): boolean {
    const expr = callExpr.getExpression();
    if (Node.isPropertyAccessExpression(expr)) {
      return EnvLoggingPattern.LOGGING_METHODS.includes(expr.getName());
    }
    return false;
  }

  private findUnsafeEnvAccess(node: Node): string | null {
    // process.env.VAR_NAME
    if (Node.isPropertyAccessExpression(node)) {
      const inner = node.getExpression();
      if (Node.isPropertyAccessExpression(inner)) {
        const root = inner.getExpression();
        if (Node.isIdentifier(root) && root.getText() === 'process' && inner.getName() === 'env') {
          const varName = node.getName();
          if (!EnvLoggingPattern.SAFE_ENV_VARS.has(varName)) return varName;
          return null;
        }
      }
    }

    // process.env['VAR_NAME']
    if (Node.isElementAccessExpression(node)) {
      const inner = node.getExpression();
      if (Node.isPropertyAccessExpression(inner)) {
        const root = inner.getExpression();
        if (Node.isIdentifier(root) && root.getText() === 'process' && inner.getName() === 'env') {
          const argExpr = node.getArgumentExpression();
          if (argExpr && Node.isStringLiteral(argExpr)) {
            const varName = argExpr.getLiteralValue();
            if (!EnvLoggingPattern.SAFE_ENV_VARS.has(varName)) return varName;
          } else {
            return 'DYNAMIC_KEY';
          }
        }
      }
    }

    for (const child of node.getChildren()) {
      const result = this.findUnsafeEnvAccess(child);
      if (result) return result;
    }

    return null;
  }
}
