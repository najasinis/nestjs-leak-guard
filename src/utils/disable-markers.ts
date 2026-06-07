import type { PatternId } from '../types';

const TS_DISABLE_NEXT_LINE = '// nestjs-leak-guard-disable-next-line';
const TS_DISABLE_BLOCK_START = '// nestjs-leak-guard-disable';
const TS_DISABLE_BLOCK_END = '// nestjs-leak-guard-enable';
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
 * @returns 1-based 라인 번호 Set
 */
export function parseDisableMarkers(content: string, patternId: PatternId): Set<number> {
  const disabledLines = new Set<number>();
  const lines = content.split('\n');
  let blockDisabled = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const trimmed = lines[i].trim();

    // disable-next-line must be checked before block-start (same prefix)
    if (trimmed.startsWith(TS_DISABLE_NEXT_LINE) || trimmed.startsWith(SQL_DISABLE_NEXT_LINE)) {
      const marker = trimmed.startsWith(TS_DISABLE_NEXT_LINE)
        ? TS_DISABLE_NEXT_LINE
        : SQL_DISABLE_NEXT_LINE;
      const rest = trimmed.slice(marker.length).trim();
      if (!rest || rest === patternId) {
        disabledLines.add(lineNum + 1);
      }
      continue;
    }

    // block end
    if (trimmed.startsWith(TS_DISABLE_BLOCK_END)) {
      const rest = trimmed.slice(TS_DISABLE_BLOCK_END.length).trim();
      if (!rest || rest === patternId) {
        blockDisabled = false;
      }
      continue;
    }

    // block start (after checking disable-next-line so we don't false-match)
    if (trimmed.startsWith(TS_DISABLE_BLOCK_START)) {
      const rest = trimmed.slice(TS_DISABLE_BLOCK_START.length).trim();
      if (!rest || rest === patternId) {
        blockDisabled = true;
      }
      continue;
    }

    if (blockDisabled) {
      disabledLines.add(lineNum);
    }
  }

  return disabledLines;
}
