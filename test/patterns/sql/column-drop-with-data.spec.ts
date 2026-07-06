import { ColumnDropWithDataPattern } from '../../../src/patterns/sql/column-drop-with-data';
import { DEFAULT_CONFIG } from '../../../src/config';
import type { PatternContext } from '../../../src/types';

function makeContext(sql: string, filePath = 'migration.sql'): PatternContext {
  return {
    filePath,
    config: { ...DEFAULT_CONFIG },
    rawContent: sql,
  };
}

describe('ColumnDropWithDataPattern', () => {
  let pattern: ColumnDropWithDataPattern;

  beforeEach(() => {
    pattern = new ColumnDropWithDataPattern();
  });

  describe('취약한 코드 감지', () => {
    it('ALTER TABLE ... DROP COLUMN → MEDIUM 결과', () => {
      const sql = `ALTER TABLE users DROP COLUMN legacy_field;`;
      const results = pattern.analyze(makeContext(sql));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('medium');
      expect(results[0].pattern).toBe('column-drop-with-data');
    });

    it('여러 DROP COLUMN → 결과 여러 건', () => {
      const sql = [
        `ALTER TABLE users DROP COLUMN old_col1;`,
        `ALTER TABLE orders DROP COLUMN deprecated_field;`,
      ].join('\n');
      const results = pattern.analyze(makeContext(sql));
      expect(results).toHaveLength(2);
    });

    it('결과에 suggestion 필드가 비어있지 않음', () => {
      const sql = `ALTER TABLE posts DROP COLUMN content_v1;`;
      const results = pattern.analyze(makeContext(sql));
      expect(results[0].suggestion).toBeTruthy();
    });
  });

  describe('안전한 코드 통과', () => {
    it('"-- confirmed empty" 주석 뒤 DROP COLUMN → 결과 없음', () => {
      const sql = [
        `-- confirmed empty`,
        `ALTER TABLE users DROP COLUMN temp_col;`,
      ].join('\n');
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });

    it('"-- no data" 주석 뒤 DROP COLUMN → 결과 없음', () => {
      const sql = [
        `-- no data`,
        `ALTER TABLE users DROP COLUMN unused_col;`,
      ].join('\n');
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });

    it('DROP TABLE (컬럼 아님) → 결과 없음', () => {
      const sql = `DROP TABLE IF EXISTS legacy_table;`;
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });

    it('ADD COLUMN → 결과 없음', () => {
      const sql = `ALTER TABLE users ADD COLUMN new_field VARCHAR(255);`;
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });
  });

  describe('검사 제외 마커', () => {
    it('SQL disable-next-line 마커 → 결과 없음', () => {
      const sql = [
        `-- nestjs-leak-guard-disable-next-line column-drop-with-data`,
        `ALTER TABLE users DROP COLUMN legacy_field;`,
      ].join('\n');
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });
  });

  describe('.sql 파일 확장자 검사', () => {
    it('.ts 파일 경로 → 결과 없음 (SQL 파일 아님)', () => {
      const sql = `ALTER TABLE users DROP COLUMN old_col;`;
      expect(pattern.analyze(makeContext(sql, 'migration.ts'))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 column-drop-with-data 이다', () => {
      expect(pattern.id).toBe('column-drop-with-data');
    });

    it('level이 medium 이다', () => {
      expect(pattern.level).toBe('medium');
    });
  });
});
