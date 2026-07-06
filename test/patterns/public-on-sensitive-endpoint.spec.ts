import { Project } from 'ts-morph';
import { PublicOnSensitiveEndpointPattern } from '../../src/patterns/public-on-sensitive-endpoint';
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

describe('PublicOnSensitiveEndpointPattern', () => {
  let pattern: PublicOnSensitiveEndpointPattern;

  beforeEach(() => {
    pattern = new PublicOnSensitiveEndpointPattern();
  });

  describe('취약한 코드 감지', () => {
    it('@Public() + @Delete("/admin/users") → HIGH 결과', () => {
      const code = `
class UserController {
  @Public()
  @Delete('/admin/users')
  deleteAll() {}
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
      expect(results[0].pattern).toBe('public-on-sensitive-endpoint');
    });

    it('@Public() + @Post("/admin/data") → HIGH 결과', () => {
      const code = `
class AdminController {
  @Public()
  @Post('/admin/data')
  createAdmin() {}
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
    });

    it('@Public() + @Delete("/items") → MEDIUM 결과 (민감 경로 키워드 없음)', () => {
      const code = `
class ItemController {
  @Public()
  @Delete('/items')
  removeItem() {}
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('medium');
    });

    it('결과에 suggestion 필드가 비어있지 않음', () => {
      const code = `
class Ctrl {
  @Public()
  @Delete('/admin/purge')
  purge() {}
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results[0].suggestion).toBeTruthy();
    });
  });

  describe('안전한 코드 통과', () => {
    it('@Public() 없는 @Delete("/admin/users") → 결과 없음', () => {
      const code = `
class UserController {
  @Delete('/admin/users')
  deleteAll() {}
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });

    it('@Public() + @Get("/health") → 결과 없음 (읽기 전용 메서드)', () => {
      const code = `
class HealthController {
  @Public()
  @Get('/health')
  check() {}
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('검사 제외 마커', () => {
    it('disable 블록 마커로 감싼 코드 → 결과 없음', () => {
      const code = `
class Ctrl {
  // nestjs-leak-guard-disable public-on-sensitive-endpoint
  @Public()
  @Delete('/admin/users')
  deleteAll() {}
  // nestjs-leak-guard-enable public-on-sensitive-endpoint
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 public-on-sensitive-endpoint 이다', () => {
      expect(pattern.id).toBe('public-on-sensitive-endpoint');
    });

    it('기본 level이 medium 이다', () => {
      expect(pattern.level).toBe('medium');
    });
  });
});
