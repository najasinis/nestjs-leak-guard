import * as fs from 'fs';
import * as path from 'path';
import type { LeakGuardConfig, RuleLevel, PatternId } from './types';

// 설정 파일을 찾지 못했을 때 사용하는 기본값
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

/**
 * .leak-guard.json (또는 --config 경로) 파일을 읽어 DEFAULT_CONFIG와 머지.
 *
 * 탐색 순서:
 *   1. configPath가 명시된 경우 → 해당 경로
 *   2. cwd() 기준으로 .leak-guard.json 탐색
 *   3. 없으면 DEFAULT_CONFIG 반환
 */
export function loadConfig(configPath?: string, cwd = process.cwd()): LeakGuardConfig {
  // TODO: configPath 또는 cwd/.leak-guard.json 읽기
  // TODO: JSON.parse 후 DEFAULT_CONFIG와 deep merge
  // TODO: rules 유효성 검증 (알 수 없는 패턴 ID 경고)
  throw new Error('loadConfig: not implemented');
}

/**
 * tenantShield: true 시 package.json에서 nestjs-tenant-shield 설치 여부 확인.
 * 설치되어 있으면 config.tenantShield = true를 확정.
 */
export function detectTenantShield(config: LeakGuardConfig, cwd = process.cwd()): LeakGuardConfig {
  // TODO: cwd/package.json 읽기
  // TODO: dependencies 또는 devDependencies에 config.tenantShieldImport 있는지 확인
  // TODO: 있으면 config.tenantShield = true 반환
  throw new Error('detectTenantShield: not implemented');
}

/**
 * RuleLevel → Severity 변환.
 * 'error' → 'high', 'warn' → 'medium', 'off' → 스킵 (호출자가 처리)
 */
export function ruleLevelToSeverity(level: RuleLevel): 'high' | 'medium' {
  // TODO: 매핑 반환
  throw new Error('ruleLevelToSeverity: not implemented');
}
