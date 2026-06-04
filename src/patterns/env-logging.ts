import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

/**
 * [P1-HIGH] env-logging
 *
 * 감지: 로깅 호출 인자에 process.env.* 가 포함된 경우.
 *       환경변수에는 시크릿이 담기므로 로그로 유출되면 위험.
 *
 * 통과:
 *   - NODE_ENV, PORT, LOG_LEVEL 등 비시크릿 변수는 허용 목록으로 관리
 *   - 마커
 */
export class EnvLoggingPattern extends BasePattern {
  readonly id = 'env-logging' as const;
  readonly level = 'high' as const;
  readonly description = 'process.env variable passed to logger — potential secret exposure';

  // 로그에 찍어도 안전한 비시크릿 환경변수 (허용 목록)
  private static readonly SAFE_ENV_VARS = new Set([
    'NODE_ENV', 'PORT', 'LOG_LEVEL', 'TZ', 'HOSTNAME',
  ]);

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. 로깅 CallExpression 수집 (password-logging과 동일 탐지 로직 재사용)
    // 2. 인자 재귀 탐색 중 PropertyAccessExpression 발견 시:
    //    a. 체인이 process.env.XXX 형태인지 확인
    //    b. XXX가 SAFE_ENV_VARS에 없으면 → 위험
    // 3. makeResult 생성
    //    suggestion: "Avoid logging env vars directly. Log a masked value or boolean check."
    return [];
  }
}
