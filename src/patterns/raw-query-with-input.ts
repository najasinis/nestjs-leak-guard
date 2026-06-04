import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

/**
 * [P1-HIGH] raw-query-with-input
 *
 * 감지: repo.query() 또는 dataSource.query()의 첫 번째 인자가
 *       템플릿 리터럴(`...${var}...`)인 경우 → SQL Injection 위험.
 *
 * 통과:
 *   - 파라미터화 쿼리: query('SELECT ... WHERE id = ?', [id])
 *   - 상수 문자열만 사용 (보간 없음)
 *   - 마커
 */
export class RawQueryWithInputPattern extends BasePattern {
  readonly id = 'raw-query-with-input' as const;
  readonly level = 'high' as const;
  readonly description = 'Raw SQL with string interpolation — SQL injection risk';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. SourceFile에서 CallExpression 수집
    // 2. 호출 대상이 .query() 메서드인지 확인
    //    → PropertyAccessExpression의 name.text === 'query'
    // 3. 첫 번째 인자가 TemplateLiteral(NoSubstitutionTemplateLiteral 제외)인지 확인
    //    → TemplateExpression: `...${expr}...` 형태면 위험
    // 4. 위험하면 makeResult 생성
    //    suggestion: "Use parameterized query: repo.query('...WHERE id = ?', [id])"
    return [];
  }
}
