import { BasePattern } from '../base';
import type { PatternContext, ScanResult } from '../../types';

/**
 * [P3-MEDIUM] column-drop-with-data
 *
 * 감지: SQL 마이그레이션 파일에서 ALTER TABLE ... DROP COLUMN 구문.
 *       데이터가 있는 컬럼을 삭제하면 복구 불가능.
 *
 * 통과:
 *   - 주석으로 "confirmed empty" 또는 "no data" 명시 시 경고만
 *   - 마커 (`-- nestjs-leak-guard-disable-next-line column-drop-with-data`)
 */
export class ColumnDropWithDataPattern extends BasePattern {
  readonly id = 'column-drop-with-data' as const;
  readonly level = 'medium' as const;
  readonly description = 'DROP COLUMN is irreversible — ensure column has no important data';

  protected analyzeFile(context: PatternContext): ScanResult[] {
    // pseudo:
    // 1. context.rawContent가 SQL인지 확인 (.ts 파일이면 skip)
    // 2. 정규식 또는 node-sql-parser로 DROP COLUMN 구문 탐지
    // 3. 직전 줄에 "confirmed empty" / "no data" / "disable" 마커가 있으면 skip
    // 4. makeResult 생성
    //    suggestion: "Verify column has no important data. Consider soft-delete (nullable) first."
    return [];
  }
}
