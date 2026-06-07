import type { Pattern, PatternContext, ScanResult, PatternId, Severity } from '../types';
import { parseDisableMarkers } from '../utils/disable-markers';

export abstract class BasePattern implements Pattern {
  abstract readonly id: PatternId;
  abstract readonly level: Severity;
  abstract readonly description: string;

  protected get docsUrl(): string {
    return `https://github.com/jinyeong-jung/nestjs-leak-guard/wiki/${this.id}`;
  }

  analyze(context: PatternContext): ScanResult[] {
    const content = context.rawContent ?? '';
    const disabledLines = parseDisableMarkers(content, this.id);
    const raw = this.analyzeFile(context);
    return raw.filter((r) => !disabledLines.has(r.line));
  }

  protected abstract analyzeFile(context: PatternContext): ScanResult[];

  protected makeResult(
    filePath: string,
    line: number,
    column: number,
    message: string,
    code: string,
    suggestion: string,
  ): ScanResult {
    return {
      file: filePath,
      line,
      column,
      pattern: this.id,
      level: this.level,
      message,
      code,
      suggestion,
      docsUrl: this.docsUrl,
    };
  }
}
