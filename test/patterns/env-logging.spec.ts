import { Project } from 'ts-morph';
import { EnvLoggingPattern } from '../../src/patterns/env-logging';
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

describe('EnvLoggingPattern', () => {
  let pattern: EnvLoggingPattern;

  beforeEach(() => {
    pattern = new EnvLoggingPattern();
  });

  describe('취약한 코드 감지', () => {
    it('console.log에 process.env.DATABASE_URL → HIGH 결과', () => {
      const code = `
class Service {
  method() {
    console.log(process.env.DATABASE_URL);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
      expect(results[0].pattern).toBe('env-logging');
      expect(results[0].message).toContain('DATABASE_URL');
    });

    it('NestJS Logger.warn에 process.env.JWT_SECRET → HIGH 결과', () => {
      const code = `
class Service {
  method() {
    this.logger.warn(process.env.JWT_SECRET);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
      expect(results[0].message).toContain('JWT_SECRET');
    });

    it('process.env["DATABASE_URL"] 브라켓 접근도 감지', () => {
      const code = `
class Service {
  method() {
    console.error(process.env['DATABASE_URL']);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
    });

    it('결과에 suggestion 필드가 비어있지 않음', () => {
      const code = `
class S {
  m() { console.log(process.env.API_SECRET); }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results[0].suggestion).toBeTruthy();
    });
  });

  describe('안전한 코드 통과', () => {
    it('process.env.NODE_ENV (안전 목록) → 결과 없음', () => {
      const code = `
class Service {
  method() {
    console.log(process.env.NODE_ENV);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });

    it('process.env.PORT (안전 목록) → 결과 없음', () => {
      const code = `
class Service {
  method() {
    console.log(process.env.PORT);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });

    it('process.env 없는 일반 로깅 → 결과 없음', () => {
      const code = `
class Service {
  method() {
    console.log(user.email);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('검사 제외 마커', () => {
    it('disable-next-line 마커 다음 줄 → 결과 없음', () => {
      const code = `
class Service {
  method() {
    // nestjs-leak-guard-disable-next-line env-logging
    console.log(process.env.DATABASE_URL);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 env-logging 이다', () => {
      expect(pattern.id).toBe('env-logging');
    });

    it('level이 high 이다', () => {
      expect(pattern.level).toBe('high');
    });
  });
});
