import { Node, SyntaxKind, SourceFile, CallExpression } from 'ts-morph';
import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

export class PasswordLoggingPattern extends BasePattern {
  readonly id = 'password-logging' as const;
  readonly level = 'high' as const;
  readonly description = 'Sensitive field (password/secret/token) passed to logger — credential exposure risk';

  private static readonly SENSITIVE_KEYWORDS = [
    'password', 'pwd', 'passwd',
    'secret', 'apikey', 'api_key',
    'privatekey', 'private_key',
    'accesstoken', 'access_token',
    'refreshtoken', 'refresh_token',
    'credential',
  ];

  private static readonly LOGGING_METHODS = ['log', 'error', 'warn', 'debug', 'verbose', 'info'];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.sourceFile) return [];

    const sourceFile = context.sourceFile as SourceFile;
    const results: ScanResult[] = [];

    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      if (!this.isLoggingCall(callExpr)) return;

      for (const arg of callExpr.getArguments()) {
        const found = this.findSensitiveKeyword(arg);
        if (found) {
          const lc = sourceFile.compilerNode.getLineAndCharacterOfPosition(callExpr.getStart());
          results.push(this.makeResult(
            context.filePath,
            lc.line + 1,
            lc.character + 1,
            `Sensitive field "${found}" passed to logger — credential exposure risk`,
            callExpr.getText().slice(0, 120),
            'Never log sensitive fields. Use maskSensitive(value) or log only a boolean/length.',
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
      return PasswordLoggingPattern.LOGGING_METHODS.includes(expr.getName());
    }
    if (Node.isIdentifier(expr)) {
      return PasswordLoggingPattern.LOGGING_METHODS.includes(expr.getText());
    }
    return false;
  }

  private findSensitiveKeyword(node: Node): string | null {
    if (Node.isPropertyAccessExpression(node)) {
      const name = node.getName().toLowerCase();
      for (const kw of PasswordLoggingPattern.SENSITIVE_KEYWORDS) {
        if (name === kw || name.includes(kw)) return node.getName();
      }
    }

    if (Node.isStringLiteral(node)) {
      const text = node.getLiteralValue().toLowerCase();
      for (const kw of PasswordLoggingPattern.SENSITIVE_KEYWORDS) {
        if (text.includes(kw)) return kw;
      }
    }

    if (Node.isTemplateExpression(node)) {
      for (const span of node.getTemplateSpans()) {
        const result = this.findSensitiveKeyword(span.getExpression());
        if (result) return result;
      }
      return null;
    }

    // Avoid recursing into deeply nested trees that aren't logging arguments
    for (const child of node.getChildren()) {
      const result = this.findSensitiveKeyword(child);
      if (result) return result;
    }

    return null;
  }
}
