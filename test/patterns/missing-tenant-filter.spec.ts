import { Project } from 'ts-morph';
import { MissingTenantFilterPattern } from '../../src/patterns/missing-tenant-filter';
import { DEFAULT_CONFIG } from '../../src/config';
import type { PatternContext } from '../../src/types';

function makeContext(code: string, overrides?: Partial<PatternContext>): PatternContext {
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
    ...overrides,
  };
}

describe('MissingTenantFilterPattern', () => {
  let pattern: MissingTenantFilterPattern;

  beforeEach(() => {
    pattern = new MissingTenantFilterPattern();
  });

  describe('취약한 코드 감지', () => {
    it('tenantId 없는 repo.find() → HIGH 결과 반환', () => {
      const code = `
class Service {
  method() {
    return this.repo.find();
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
      expect(results[0].pattern).toBe('missing-tenant-filter');
    });

    it('tenantId 없는 repo.findOne() → HIGH 결과 반환', () => {
      const code = `
class Service {
  method() {
    return this.repo.findOne({ where: { name: 'test' } });
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
    });

    it('tenantId 없는 userRepository.count() → HIGH 결과 반환', () => {
      const code = `
class Service {
  method() {
    return this.userRepository.count({ where: { active: true } });
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
    });

    it('감지된 결과에 suggestion 필드가 비어있지 않음', () => {
      const code = `
class Service {
  method() { return this.repo.find(); }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results[0].suggestion).toBeTruthy();
    });
  });

  describe('안전한 코드 통과', () => {
    it('where: { tenantId } 명시된 find() → 결과 없음', () => {
      const code = `
class Service {
  method(tenantId: string) {
    return this.repo.find({ where: { tenantId } });
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });

    it('@RequireTenant() 클래스 (tenantShield: true) → 결과 없음', () => {
      const code = `
@RequireTenant()
class Service {
  method() {
    return this.repo.find();
  }
}`;
      const ctx = makeContext(code, { config: { ...DEFAULT_CONFIG, tenantShield: true } });
      expect(pattern.analyze(ctx)).toHaveLength(0);
    });
  });

  describe('검사 제외 마커', () => {
    it('disable-next-line 마커 다음 줄 → 결과 없음', () => {
      const code = `
class Service {
  method() {
    // nestjs-leak-guard-disable-next-line missing-tenant-filter
    return this.repo.find();
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 missing-tenant-filter 이다', () => {
      expect(pattern.id).toBe('missing-tenant-filter');
    });

    it('level이 high 이다', () => {
      expect(pattern.level).toBe('high');
    });
  });
});
