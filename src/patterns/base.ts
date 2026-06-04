import type { Pattern, PatternContext, ScanResult, PatternId, Severity } from '../types';

/**
 * 모든 패턴이 상속하는 추상 기반 클래스.
 *
 * 하위 클래스가 구현해야 하는 것:
 *   - id, level, description 프로퍼티
 *   - analyzeFile(context): ScanResult[]
 *
 * 기반 클래스가 제공하는 것:
 *   - 검사 제외 마커 파싱 (// nestjs-leak-guard-disable-next-line <id>)
 *   - docsUrl 자동 생성
 */
export abstract class BasePattern implements Pattern {
  abstract readonly id: PatternId;
  abstract readonly level: Severity;
  abstract readonly description: string;

  /** 기반 문서 URL */
  protected get docsUrl(): string {
    return `https://github.com/jinyeong-jung/nestjs-leak-guard/wiki/${this.id}`;
  }

  /**
   * 외부에서 호출하는 진입점.
   * 1. 검사 제외 마커가 있는 라인 번호 목록 수집
   * 2. analyzeFile 실행
   * 3. 마커가 있는 라인 결과 필터링
   */
  analyze(context: PatternContext): ScanResult[] {
    // TODO: parseDisableMarkers(context.rawContent ?? '', this.id) 로 제외 라인 수집
    // TODO: const raw = this.analyzeFile(context)
    // TODO: return raw.filter(r => !disabledLines.has(r.line))
    throw new Error(`${this.id}.analyze: not implemented`);
  }

  /**
   * 하위 클래스가 구현하는 실제 분석 로직.
   * 마커 필터링은 analyze()가 처리하므로 여기서는 순수하게 AST 탐색만.
   */
  protected abstract analyzeFile(context: PatternContext): ScanResult[];

  /** ScanResult 조립 헬퍼 */
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
