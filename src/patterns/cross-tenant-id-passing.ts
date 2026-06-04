import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

/**
 * [P2-MEDIUM] cross-tenant-id-passing
 *
 * 감지: 요청 파라미터/body에서 받은 tenantId를 검증 없이
 *       Repository 쿼리 조건에 직접 사용하는 경우.
 *
 * 패턴 예:
 *   async find(query: any) {
 *     return this.repo.find({ where: { tenantId: query.tenantId } });
 *   }
 *
 * 위험: 사용자가 tenantId를 변조해 타 tenant 데이터 접근 가능.
 *
 * 통과:
 *   - getCurrentTenantId() 헬퍼 사용 (ALS 기반, 검증된 출처)
 *   - req.user.tenantId (인증 미들웨어 통과 후 값)에는 경고만
 *   - 마커
 */
export class CrossTenantIdPassingPattern extends BasePattern {
  readonly id = 'cross-tenant-id-passing' as const;
  readonly level = 'medium' as const;
  readonly description = 'User-supplied tenantId used directly in query — tenant spoofing risk';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. Repository find/findOne 호출의 where.tenantId 값 추적
    // 2. 값이 메서드 파라미터(특히 query.* / body.* / dto.*)에서 오는지 확인
    //    → PropertyAccessExpression 체인 분석
    // 3. 검증된 출처(getCurrentTenantId() 반환값) 여부 확인
    // 4. 검증 안 된 출처면 makeResult 생성
    return [];
  }
}
