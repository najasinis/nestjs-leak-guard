import * as fs from 'fs';
import { Project } from 'ts-morph';
import type { ScanResult, ScanSummary, ScanOptions, LeakGuardConfig } from './types';
import { getPatterns } from './patterns';
import { collectFilesFromPath, isExcluded } from './utils/glob';
import { getGitStagedFiles } from './utils/git';

export async function scan(
  options: ScanOptions,
  config: LeakGuardConfig,
): Promise<{ results: ScanResult[]; summary: ScanSummary }> {
  const start = Date.now();
  const files = await collectFiles(options, config);

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { skipLibCheck: true, noEmit: true },
  });

  const patterns = getPatterns(options.patterns);
  const results: ScanResult[] = [];

  for (const file of files) {
    const isTs = file.endsWith('.ts');
    const isSql = file.endsWith('.sql');
    if (!isTs && !isSql) continue;

    let rawContent: string;
    try {
      rawContent = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }

    const sourceFile = isTs ? project.addSourceFileAtPath(file) : undefined;
    const context = { filePath: file, config, sourceFile, rawContent };

    for (const pattern of patterns) {
      const ruleLevel = config.rules[pattern.id];
      if (ruleLevel === 'off') continue;

      try {
        const patternResults = pattern.analyze(context);
        results.push(...patternResults);
      } catch {
        // pattern errors are non-fatal
      }
    }
  }

  const durationMs = Date.now() - start;
  return { results, summary: buildSummary(results, files.length, durationMs) };
}

export async function collectFiles(
  options: ScanOptions,
  config: LeakGuardConfig,
): Promise<string[]> {
  if (options.staged) {
    return getGitStagedFiles().filter((f) => !isExcluded(f, config.exclude));
  }
  return collectFilesFromPath(options.path, config);
}

export function buildSummary(
  results: ScanResult[],
  fileCount: number,
  durationMs: number,
): ScanSummary {
  const high = results.filter((r) => r.level === 'high').length;
  const medium = results.filter((r) => r.level === 'medium').length;
  const low = results.filter((r) => r.level === 'low').length;
  return { files: fileCount, issues: results.length, high, medium, low, durationMs };
}

export function shouldFail(
  summary: ScanSummary,
  failOn: ScanOptions['failOn'],
): boolean {
  if (failOn === 'none') return false;
  if (failOn === 'high') return summary.high > 0;
  if (failOn === 'medium') return summary.high + summary.medium > 0;
  if (failOn === 'low') return summary.issues > 0;
  return false;
}
