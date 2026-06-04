#!/usr/bin/env node
import { Command } from 'commander';
import { scan, collectFiles, shouldFail } from './scanner';
import { loadConfig, detectTenantShield } from './config';
import { createReporter } from './reporter';
import type { ScanOptions } from './types';

const program = new Command();

program
  .name('nestjs-leak-guard')
  .description('Static analysis CLI for NestJS data-leak risk detection')
  .version('0.0.1');

program
  .command('scan [path]')
  .description('Scan TypeScript/SQL files for data-leak risk patterns')
  .option('--staged', 'Only scan git staged files', false)
  .option('--fail-on <level>', 'Exit 1 when issues at this level or above found', 'high')
  .option('--output <format>', 'Output format: text | json | sarif | markdown', 'text')
  .option('--config <path>', 'Path to .leak-guard.json config file')
  .option('--patterns <list>', 'Comma-separated pattern IDs to run')
  .option('--tsconfig <path>', 'Path to tsconfig.json', 'tsconfig.json')
  .option('--quiet', 'Only output issues, suppress summary', false)
  .option('--no-color', 'Disable color output')
  .action(async (scanPath: string | undefined, opts: Record<string, unknown>) => {
    // TODO: 옵션 파싱 → ScanOptions 조립
    // TODO: config = loadConfig(opts.config)
    // TODO: config = detectTenantShield(config)
    // TODO: const { results, summary } = await scan(options, config)
    // TODO: const reporter = createReporter(opts.output)
    // TODO: reporter.report(results, summary)
    // TODO: if (shouldFail(summary, opts.failOn)) process.exit(1)
    console.log('scan command: not implemented');
    process.exit(0);
  });

program.parse(process.argv);
