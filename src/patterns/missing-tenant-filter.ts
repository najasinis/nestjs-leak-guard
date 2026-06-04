import { BasePattern } from './base';
import type { PatternContext, ScanResult } from '../types';

/**
 * [P1-HIGH] missing-tenant-filter
 *
 * 감지: TypeORM Repository 메서드 (find/findOne/findBy/count 등)를
 *       tenantId 조건 없이 호출하는 경우.
 *
 * 통과:
 *   - where: { tenantId: ... } 직접 명시
 *   - 클래스 또는 메서드에 @RequireTenant() 적용 (tenantShield: true 시)
 *   - // nestjs-leak-guard-disable-next-line missing-tenant-filter 마커
 */
export class MissingTenantFilterPattern extends BasePattern {
  readonly id = 'missing-tenant-filter' as const;
  readonly level = 'high' as const;
  readonly description = 'Repository query without tenantId filter — cross-tenant data leak risk';

  // tenantId 없이 호출 위험이 있는 Repository 메서드
  private static readonly DANGEROUS_METHODS = [
    'find', 'findOne', 'findBy', 'findOneBy',
    'findAndCount', 'findAndCountBy', 'count',
  ];

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. context.sourceFile (ts-morph SourceFile)에서 CallExpression 노드 수집
    // 2. 각 CallExpression에서 PropertyAccessExpression 확인
    //    → object가 this.repo/this.repository 패턴인지
    //    → method명이 DANGEROUS_METHODS에 포함되는지
    // 3. 포함되면 호출 인자(options) 검사:
    //    a. 인자가 없으면 → 위험
    //    b. 인자가 있으면 where 속성에 tenantIdField가 있는지 확인
    // 4. config.tenantShield === true이면:
    //    - 해당 클래스에 @RequireTenant() 데코레이터가 있는지 확인
    //    - 있으면 skip
    // 5. 위험하면 makeResult(...)로 ScanResult 생성
    return [];
  }
}
