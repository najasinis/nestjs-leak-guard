import { Node, SyntaxKind, SourceFile } from 'ts-morph';
import { BasePattern } from './base';
import type { PatternContext, ScanResult, Severity } from '../types';

export class PublicOnSensitiveEndpointPattern extends BasePattern {
  readonly id = 'public-on-sensitive-endpoint' as const;
  readonly level = 'medium' as const;
  readonly description = '@Public() combined with mutating/admin endpoint — authentication bypass risk';

  private static readonly SENSITIVE_PATH_KEYWORDS = ['admin', 'delete', 'remove', 'purge', 'truncate', 'drop'];
  private static readonly MUTATING_HTTP_DECORATORS = ['Post', 'Put', 'Patch', 'Delete'];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    if (!context.sourceFile) return [];

    const sourceFile = context.sourceFile as SourceFile;
    const results: ScanResult[] = [];

    sourceFile.getClasses().forEach((classDecl) => {
      classDecl.getMethods().forEach((method) => {
        const decorators = method.getDecorators();
        const hasPublic = decorators.some((d) => d.getName() === 'Public');
        if (!hasPublic) return;

        const httpDecorator = decorators.find((d) =>
          PublicOnSensitiveEndpointPattern.MUTATING_HTTP_DECORATORS.includes(d.getName()),
        );
        if (!httpDecorator) return;

        const pathArg = httpDecorator.getArguments()[0];
        const pathStr =
          pathArg && Node.isStringLiteral(pathArg) ? pathArg.getLiteralValue().toLowerCase() : '';

        const isSensitivePath = PublicOnSensitiveEndpointPattern.SENSITIVE_PATH_KEYWORDS.some((kw) =>
          pathStr.includes(kw),
        );

        const level: Severity = isSensitivePath ? 'high' : 'medium';
        const lc = sourceFile.compilerNode.getLineAndCharacterOfPosition(method.getStart());

        results.push({
          ...this.makeResult(
            context.filePath,
            lc.line + 1,
            lc.character + 1,
            `@Public() on @${httpDecorator.getName()}('${pathStr || '…'}') — authentication bypass risk`,
            method.getName() + '()',
            'Remove @Public() or restrict this endpoint to authenticated users only.',
          ),
          level,
        });
      });
    });

    return results;
  }
}
