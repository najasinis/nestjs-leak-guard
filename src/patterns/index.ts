import type { Pattern, PatternId } from '../types';
import { MissingTenantFilterPattern } from './missing-tenant-filter';
import { RawQueryWithInputPattern } from './raw-query-with-input';
import { PasswordLoggingPattern } from './password-logging';
import { EnvLoggingPattern } from './env-logging';
import { PublicOnSensitiveEndpointPattern } from './public-on-sensitive-endpoint';
import { CrossTenantIdPassingPattern } from './cross-tenant-id-passing';
import { EnumModifyExistingPattern } from './sql/enum-modify-existing';
import { ColumnDropWithDataPattern } from './sql/column-drop-with-data';

/** 전체 패턴 레지스트리 */
const ALL_PATTERNS: Pattern[] = [
  new MissingTenantFilterPattern(),
  new RawQueryWithInputPattern(),
  new PasswordLoggingPattern(),
  new EnvLoggingPattern(),
  new PublicOnSensitiveEndpointPattern(),
  new CrossTenantIdPassingPattern(),
  new EnumModifyExistingPattern(),
  new ColumnDropWithDataPattern(),
];

/**
 * 활성화할 패턴 목록 반환.
 *
 * @param allowList - undefined면 전체, 지정 시 해당 패턴만
 */
export function getPatterns(allowList?: PatternId[]): Pattern[] {
  if (!allowList) return ALL_PATTERNS;
  return ALL_PATTERNS.filter((p) => allowList.includes(p.id));
}

/** ID로 단일 패턴 조회 */
export function getPattern(id: PatternId): Pattern | undefined {
  return ALL_PATTERNS.find((p) => p.id === id);
}
