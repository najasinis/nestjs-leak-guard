import * as fs from 'fs';
import * as path from 'path';
import type { LeakGuardConfig, RuleLevel, PatternId } from './types';

export const DEFAULT_CONFIG: LeakGuardConfig = {
  rules: {
    'missing-tenant-filter': 'error',
    'raw-query-with-input': 'error',
    'password-logging': 'error',
    'env-logging': 'error',
    'public-on-sensitive-endpoint': 'warn',
    'cross-tenant-id-passing': 'warn',
    'enum-modify-existing': 'warn',
    'column-drop-with-data': 'warn',
  },
  tenantShield: false,
  tenantShieldImport: 'nestjs-tenant-shield',
  tenantIdField: 'tenantId',
  exclude: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/node_modules/**',
    '**/dist/**',
  ],
  tsconfig: 'tsconfig.json',
};

const VALID_PATTERN_IDS = new Set<string>([
  'missing-tenant-filter', 'raw-query-with-input', 'password-logging',
  'env-logging', 'public-on-sensitive-endpoint', 'cross-tenant-id-passing',
  'enum-modify-existing', 'column-drop-with-data',
]);

/**
 * .leak-guard.json (또는 --config 경로) 파일을 읽어 DEFAULT_CONFIG와 머지.
 */
export function loadConfig(configPath?: string, cwd = process.cwd()): LeakGuardConfig {
  const configFile = configPath ?? path.join(cwd, '.leak-guard.json');

  if (!fs.existsSync(configFile)) {
    return { ...DEFAULT_CONFIG, rules: { ...DEFAULT_CONFIG.rules } };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  } catch (e) {
    process.stderr.write(`[nestjs-leak-guard] Failed to parse ${configFile}: ${e}\n`);
    return { ...DEFAULT_CONFIG, rules: { ...DEFAULT_CONFIG.rules } };
  }

  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_CONFIG, rules: { ...DEFAULT_CONFIG.rules } };
  }

  const partial = raw as Partial<LeakGuardConfig>;

  if (partial.rules) {
    for (const key of Object.keys(partial.rules)) {
      if (!VALID_PATTERN_IDS.has(key)) {
        process.stderr.write(`[nestjs-leak-guard] Unknown pattern ID in config: "${key}"\n`);
      }
    }
  }

  return {
    ...DEFAULT_CONFIG,
    ...partial,
    rules: { ...DEFAULT_CONFIG.rules, ...(partial.rules ?? {}) },
    // merge excludes so default spec/test exclusions are always active
    exclude: [
      ...DEFAULT_CONFIG.exclude,
      ...(partial.exclude ?? []).filter((e) => !DEFAULT_CONFIG.exclude.includes(e)),
    ],
  };
}

/**
 * package.json에서 nestjs-tenant-shield 설치 여부 확인.
 */
export function detectTenantShield(config: LeakGuardConfig, cwd = process.cwd()): LeakGuardConfig {
  const pkgPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(pkgPath)) return config;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    if (config.tenantShieldImport in allDeps) {
      return { ...config, tenantShield: true };
    }
  } catch {
    // ignore — non-fatal
  }

  return config;
}

/**
 * RuleLevel → Severity 변환.
 */
export function ruleLevelToSeverity(level: RuleLevel): 'high' | 'medium' {
  return level === 'error' ? 'high' : 'medium';
}
