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

describe('buildSummary', () => {
  it.todo('결과 없을 때 모든 카운트가 0');
  it.todo('HIGH 2개, MEDIUM 1개 결과 → summary.high=2, medium=1, issues=3');
  it.todo('fileCount와 durationMs가 summary에 반영됨');
});

describe('shouldFail', () => {
  it.todo("failOn='none' → HIGH 있어도 false");
  it.todo("failOn='high', HIGH 있음 → true");
  it.todo("failOn='high', HIGH 없음 → false");
  it.todo("failOn='medium', MEDIUM 있음 → true");
  it.todo("failOn='low', LOW 있음 → true");
});
