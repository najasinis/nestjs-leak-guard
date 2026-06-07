import { buildSummary, shouldFail } from '../src/scanner';
import type { ScanResult, ScanSummary } from '../src/types';

const makeResult = (level: ScanResult['level']): ScanResult => ({
  file: 'test.ts',
  line: 1,
  column: 1,
  pattern: 'password-logging',
  level,
  message: 'test',
  code: 'test',
  suggestion: 'test',
  docsUrl: 'https://example.com',
});

const baseSummary: ScanSummary = {
  files: 1,
  issues: 0,
  high: 0,
  medium: 0,
  low: 0,
  durationMs: 10,
};

describe('buildSummary', () => {
  it('결과 없을 때 모든 카운트가 0', () => {
    const s = buildSummary([], 5, 100);
    expect(s.issues).toBe(0);
    expect(s.high).toBe(0);
    expect(s.medium).toBe(0);
    expect(s.low).toBe(0);
    expect(s.files).toBe(5);
    expect(s.durationMs).toBe(100);
  });

  it('HIGH 2개, MEDIUM 1개 결과 → summary.high=2, medium=1, issues=3', () => {
    const results = [makeResult('high'), makeResult('high'), makeResult('medium')];
    const s = buildSummary(results, 3, 50);
    expect(s.high).toBe(2);
    expect(s.medium).toBe(1);
    expect(s.low).toBe(0);
    expect(s.issues).toBe(3);
  });

  it('fileCount와 durationMs가 summary에 반영됨', () => {
    const s = buildSummary([], 10, 250);
    expect(s.files).toBe(10);
    expect(s.durationMs).toBe(250);
  });
});

describe('shouldFail', () => {
  it("failOn='none' → HIGH 있어도 false", () => {
    expect(shouldFail({ ...baseSummary, high: 5, issues: 5 }, 'none')).toBe(false);
  });

  it("failOn='high', HIGH 있음 → true", () => {
    expect(shouldFail({ ...baseSummary, high: 1, issues: 1 }, 'high')).toBe(true);
  });

  it("failOn='high', HIGH 없고 MEDIUM만 있음 → false", () => {
    expect(shouldFail({ ...baseSummary, medium: 3, issues: 3 }, 'high')).toBe(false);
  });

  it("failOn='medium', MEDIUM 있음 → true", () => {
    expect(shouldFail({ ...baseSummary, medium: 1, issues: 1 }, 'medium')).toBe(true);
  });

  it("failOn='medium', HIGH도 있음 → true", () => {
    expect(shouldFail({ ...baseSummary, high: 1, issues: 1 }, 'medium')).toBe(true);
  });

  it("failOn='low', LOW 있음 → true", () => {
    expect(shouldFail({ ...baseSummary, low: 1, issues: 1 }, 'low')).toBe(true);
  });

  it("failOn='low', 결과 없음 → false", () => {
    expect(shouldFail(baseSummary, 'low')).toBe(false);
  });
});
