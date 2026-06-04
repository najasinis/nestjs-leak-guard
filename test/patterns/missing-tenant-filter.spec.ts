import * as path from 'path';
import { MissingTenantFilterPattern } from '../../src/patterns/missing-tenant-filter';
import { DEFAULT_CONFIG } from '../../src/config';
import type { PatternContext } from '../../src/types';

// ts-morph Project는 실제 구현 시 import
// import { Project } from 'ts-morph';

const FIXTURE_DIR = path.join(__dirname, '../fixtures/missing-tenant-filter');

function makeContext(fixtureName: string, overrides?: Partial<PatternContext>): PatternContext {
  const filePath = path.join(FIXTURE_DIR, fixtureName);
  return {
    filePath,
    config: DEFAULT_CONFIG,
    // sourceFile: project.addSourceFileAtPath(filePath),
    ...overrides,
  };
}

describe('MissingTenantFilterPattern', () => {
  let pattern: MissingTenantFilterPattern;

  beforeEach(() => {
    pattern = new MissingTenantFilterPattern();
  });

  describe('취약한 코드 감지', () => {
    it.todo('tenantId 없는 repo.find() → HIGH 결과 반환');
    it.todo('tenantId 없는 repo.findOne() → HIGH 결과 반환');
    it.todo('tenantId 없는 repo.count() → HIGH 결과 반환');
    it.todo('감지된 결과에 suggestion 필드가 비어있지 않음');
  });

  describe('안전한 코드 통과', () => {
    it.todo('where: { tenantId } 명시된 find() → 결과 없음');
    it.todo('@RequireTenant() 클래스 (tenantShield: true) → 결과 없음');
  });

  describe('검사 제외 마커', () => {
    it.todo('// nestjs-leak-guard-disable-next-line missing-tenant-filter 다음 줄 → 결과 없음');
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
