import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

/**
 * [P1-HIGH] password-logging
 *
 * 감지: console.log/error/warn 또는 NestJS Logger 메서드 호출에서
 *       민감 필드명(password, pwd, secret, token 등)을 포함하는 경우.
 *
 * 통과:
 *   - 마스킹 헬퍼 사용: maskPassword(user.password)
 *   - 마커
 */
export class PasswordLoggingPattern extends BasePattern {
  readonly id = 'password-logging' as const;
  readonly level = 'high' as const;
  readonly description = 'Sensitive field (password/secret/token) passed to logger — credential exposure risk';

  // 민감 필드명 키워드 (소문자 매칭)
  private static readonly SENSITIVE_KEYWORDS = [
    'password', 'pwd', 'passwd',
    'secret', 'apikey', 'api_key',
    'privatekey', 'private_key',
    'accesstoken', 'access_token',
    'refreshtoken', 'refresh_token',
    'credential',
  ];

  // 로깅 함수명
  private static readonly LOGGING_METHODS = [
    'log', 'error', 'warn', 'debug', 'verbose', 'info',
  ];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. SourceFile에서 CallExpression 수집
    // 2. 호출 대상이 로깅 메서드인지 확인
    //    → console.log, this.logger.log, Logger.log 등
    // 3. 호출 인자(Arguments)를 재귀 탐색:
    //    a. PropertyAccessExpression에서 name.text 를 SENSITIVE_KEYWORDS와 소문자 비교
    //    b. TemplateExpression 내부 TemplateSpan도 탐색
    //    c. StringLiteral에 키워드 포함 여부도 확인
    // 4. 키워드 발견 시 makeResult 생성
    //    suggestion: "Never log sensitive fields. Use maskSensitive(value) helper."
    return [];
  }
}
