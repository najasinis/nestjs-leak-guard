import { Project } from 'ts-morph';
import { RawQueryWithInputPattern } from '../../src/patterns/raw-query-with-input';
import { DEFAULT_CONFIG } from '../../src/config';
import type { PatternContext } from '../../src/types';

function makeContext(code: string): PatternContext {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { skipLibCheck: true },
  });
  const sourceFile = project.createSourceFile('test.ts', code);
  return {
    filePath: 'test.ts',
    config: { ...DEFAULT_CONFIG },
    sourceFile,
    rawContent: code,
  };
}

describe('RawQueryWithInputPattern', () => {
  let pattern: RawQueryWithInputPattern;

  beforeEach(() => {
    pattern = new RawQueryWithInputPattern();
  });

  describe('취약한 코드 감지', () => {
    it('템플릿 리터럴 보간이 있는 repo.query() → HIGH 결과', () => {
      const code = `
class Service {
  find(userId: string) {
    return this.repo.query(\`SELECT * FROM users WHERE id = \${userId}\`);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
      expect(results[0].pattern).toBe('raw-query-with-input');
    });

    it('DataSource.query() + 보간 → HIGH 결과', () => {
      const code = `
class Service {
  find(tenantId: string) {
    return this.dataSource.query(\`SELECT * FROM t WHERE tenant = \${tenantId}\`);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
    });

    it('결과의 suggestion에 파라미터화 예시 포함', () => {
      const code = `
class S {
  m(id: string) { return this.repo.query(\`SELECT * WHERE id = \${id}\`); }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results[0].suggestion).toContain('?');
    });
  });

  describe('안전한 코드 통과', () => {
    it("파라미터화 쿼리 repo.query('...?', [param]) → 결과 없음", () => {
      const code = `
class Service {
  find(id: string) {
    return this.repo.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });

    it('보간 없는 백틱 문자열 → 결과 없음', () => {
      const code = `
class Service {
  findAll() {
    return this.repo.query(\`SELECT * FROM users\`);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 raw-query-with-input 이다', () => {
      expect(pattern.id).toBe('raw-query-with-input');
    });

    it('level이 high 이다', () => {
      expect(pattern.level).toBe('high');
    });
  });
});
