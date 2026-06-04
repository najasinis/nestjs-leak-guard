import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

/**
 * [P2-MEDIUM] public-on-sensitive-endpoint
 *
 * 감지: @Public() 데코레이터와 민감 경로(@Post, @Delete, @Patch)가
 *       같은 메서드 또는 컨트롤러에 함께 붙은 경우.
 *
 * 경로에 admin/delete/remove/purge/truncate가 포함되면 HIGH로 격상.
 *
 * 통과:
 *   - @Public()이 GET 엔드포인트에만 있는 경우
 *   - 마커
 */
export class PublicOnSensitiveEndpointPattern extends BasePattern {
  readonly id = 'public-on-sensitive-endpoint' as const;
  readonly level = 'medium' as const;
  readonly description = '@Public() combined with mutating/admin endpoint — authentication bypass risk';

  private static readonly SENSITIVE_PATH_KEYWORDS = [
    'admin', 'delete', 'remove', 'purge', 'truncate', 'drop',
  ];

  private static readonly MUTATING_HTTP_DECORATORS = ['Post', 'Put', 'Patch', 'Delete'];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. SourceFile에서 ClassDeclaration (NestJS Controller) 수집
    // 2. 각 클래스의 MethodDeclaration 순회
    // 3. 메서드에 @Public() 데코레이터 있는지 확인
    // 4. 같은 메서드에 MUTATING_HTTP_DECORATORS 중 하나도 있는지 확인
    // 5. HTTP 데코레이터 인자(path string)가 SENSITIVE_PATH_KEYWORDS 포함 시 HIGH 격상
    // 6. makeResult 생성
    return [];
  }
}
