import { BasePattern } from '../base';
import type { PatternContext, ScanResult } from '../../types';

/**
 * [P3-MEDIUM] enum-modify-existing
 *
 * 감지: SQL 마이그레이션 파일에서 기존 ENUM 타입을 수정하는 구문.
 *       기존 값이 제거되면 해당 데이터가 NULL 또는 오류로 변환될 수 있음.
 *
 * 패턴 예 (MySQL):
 *   ALTER TABLE t MODIFY COLUMN status ENUM('a', 'b');  -- 기존 'c' 제거
 *
 * 패턴 예 (PostgreSQL):
 *   ALTER TYPE status_enum RENAME TO ...
 *   (신규 타입 생성 + 컬럼 변환이 더 안전)
 *
 * 통과:
 *   - 값 추가만 하는 ALTER (기존 값 모두 유지)
 *   - 마커 (`-- nestjs-leak-guard-disable-next-line enum-modify-existing`)
 */
export class EnumModifyExistingPattern extends BasePattern {
  readonly id = 'enum-modify-existing' as const;
  readonly level = 'medium' as const;
  readonly description = 'ENUM modification may silently corrupt existing rows';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. context.rawContent (SQL 텍스트) 확인
    //    - .ts 파일이면 skip (SQL 전용 패턴)
    // 2. node-sql-parser로 파싱 또는 정규식으로 탐지
    //    - MODIFY COLUMN ... ENUM(...) 패턴 감지
    //    - ALTER TYPE ... RENAME 패턴 감지
    // 3. 현재 ENUM 값 목록을 파싱해서 이전 마이그레이션과 비교 (v0.2)
    //    - v0.1에서는 ENUM 수정 자체를 경고로 처리 (FP 허용)
    // 4. makeResult 생성
    //    suggestion: "Add new column instead of modifying ENUM. Migrate data, then drop old column."
    return [];
  }
}
