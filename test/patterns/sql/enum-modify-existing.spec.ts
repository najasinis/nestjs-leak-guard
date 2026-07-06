import { EnumModifyExistingPattern } from '../../../src/patterns/sql/enum-modify-existing';
import { DEFAULT_CONFIG } from '../../../src/config';
import type { PatternContext } from '../../../src/types';

function makeContext(sql: string, filePath = 'migration.sql'): PatternContext {
  return {
    filePath,
    config: { ...DEFAULT_CONFIG },
    rawContent: sql,
  };
}

describe('EnumModifyExistingPattern', () => {
  let pattern: EnumModifyExistingPattern;

  beforeEach(() => {
    pattern = new EnumModifyExistingPattern();
  });

  describe('취약한 코드 감지', () => {
    it('MySQL MODIFY COLUMN ... ENUM → MEDIUM 결과', () => {
      const sql = `ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'banned');`;
      const results = pattern.analyze(makeContext(sql));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('medium');
      expect(results[0].pattern).toBe('enum-modify-existing');
    });

    it('PostgreSQL ALTER TYPE ... RENAME VALUE → MEDIUM 결과', () => {
      const sql = `ALTER TYPE user_status RENAME VALUE 'active' TO 'enabled';`;
      const results = pattern.analyze(makeContext(sql));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('medium');
    });

    it('PostgreSQL ALTER TYPE ... DROP VALUE → MEDIUM 결과', () => {
      const sql = `ALTER TYPE order_status DROP VALUE 'legacy';`;
      const results = pattern.analyze(makeContext(sql));
      expect(results).toHaveLength(1);
    });

    it('여러 ENUM 수정 → 결과 여러 건', () => {
      const sql = [
        `ALTER TABLE t1 MODIFY COLUMN col1 ENUM('a', 'b');`,
        `ALTER TABLE t2 MODIFY COLUMN col2 ENUM('x', 'y');`,
      ].join('\n');
      const results = pattern.analyze(makeContext(sql));
      expect(results).toHaveLength(2);
    });

    it('결과에 suggestion 필드가 비어있지 않음', () => {
      const sql = `ALTER TABLE users MODIFY COLUMN status ENUM('active');`;
      const results = pattern.analyze(makeContext(sql));
      expect(results[0].suggestion).toBeTruthy();
    });
  });

  describe('안전한 코드 통과', () => {
    it('ENUM 없는 ADD COLUMN → 결과 없음', () => {
      const sql = `ALTER TABLE users ADD COLUMN created_at TIMESTAMP;`;
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });

    it('단순 CREATE TABLE with ENUM → 결과 없음', () => {
      const sql = `CREATE TABLE orders (status ENUM('pending', 'done'));`;
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });
  });

  describe('검사 제외 마커', () => {
    it('SQL disable-next-line 마커 → 결과 없음', () => {
      const sql = [
        `-- nestjs-leak-guard-disable-next-line enum-modify-existing`,
        `ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive');`,
      ].join('\n');
      expect(pattern.analyze(makeContext(sql))).toHaveLength(0);
    });
  });

  describe('.sql 파일 확장자 검사', () => {
    it('.ts 파일 경로 → 결과 없음 (SQL 파일 아님)', () => {
      const sql = `ALTER TABLE users MODIFY COLUMN status ENUM('active');`;
      expect(pattern.analyze(makeContext(sql, 'migration.ts'))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 enum-modify-existing 이다', () => {
      expect(pattern.id).toBe('enum-modify-existing');
    });

    it('level이 medium 이다', () => {
      expect(pattern.level).toBe('medium');
    });
  });
});
