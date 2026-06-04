import type { PatternId } from '../types';

/** TypeScript 파일 검사 제외 마커 형식 */
const TS_DISABLE_NEXT_LINE = '// nestjs-leak-guard-disable-next-line';
const TS_DISABLE_BLOCK_START = '// nestjs-leak-guard-disable';
const TS_DISABLE_BLOCK_END = '// nestjs-leak-guard-enable';

/** SQL 파일 검사 제외 마커 형식 */
const SQL_DISABLE_NEXT_LINE = '-- nestjs-leak-guard-disable-next-line';

/**
 * 파일 내용을 분석해 특정 패턴이 비활성화된 라인 번호 Set 반환.
 *
 * 지원하는 마커:
 *   // nestjs-leak-guard-disable-next-line <patternId>
 *   // nestjs-leak-guard-disable <patternId>  (블록 시작)
 *   // nestjs-leak-guard-enable <patternId>   (블록 끝)
 *   // nestjs-leak-guard-disable              (모든 패턴, 블록)
 *
 * @returns 1-based 라인 번호 Set (이 라인 번호의 결과는 필터링됨)
 */
export function parseDisableMarkers(content: string, patternId: PatternId): Set<number> {
  const disabledLines = new Set<number>();
  const lines = content.split('\n');

  // TODO: 각 줄 순회
  //   - "disable-next-line <patternId>" → 다음 줄 번호 추가
  //   - "disable <patternId>" 또는 "disable" → 블록 시작 기록
  //   - "enable <patternId>" 또는 "enable" → 블록 끝, 범위 내 모든 줄 추가
  //   - SQL 마커도 동일 로직으로 처리

  return disabledLines;
}
