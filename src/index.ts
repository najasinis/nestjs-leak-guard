export type {
  ScanResult,
  ScanSummary,
  ScanOptions,
  LeakGuardConfig,
  PatternId,
  Severity,
  OutputFormat,
  RuleLevel,
  Pattern,
  PatternContext,
} from './types';

export { DEFAULT_CONFIG, loadConfig, detectTenantShield, ruleLevelToSeverity } from './config';
export { scan, collectFiles, buildSummary, shouldFail } from './scanner';
export { getPatterns, getPattern } from './patterns';
export { createReporter } from './reporter';
export type { Reporter } from './reporter';
