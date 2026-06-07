#!/usr/bin/env node
import { Command } from 'commander';
import { scan, shouldFail } from './scanner';
import { loadConfig, detectTenantShield } from './config';
import { createReporter } from './reporter';
import type { ScanOptions, PatternId, OutputFormat, Severity } from './types';

const program = new Command();

program
  .name('nestjs-leak-guard')
  .description('Static analysis CLI for NestJS data-leak risk detection')
  .version('0.0.1');

program
  .command('scan [path]')
  .description('Scan TypeScript/SQL files for data-leak risk patterns')
  .option('--staged', 'Only scan git staged files', false)
  .option(
    '--fail-on <level>',
    'Exit 1 when issues at or above this level exist: high | medium | low | none',
    'high',
  )
  .option('--output <format>', 'Output format: text | json | sarif | markdown', 'text')
  .option('--config <path>', 'Path to .leak-guard.json config file')
  .option('--patterns <list>', 'Comma-separated pattern IDs to run (all by default)')
  .option('--tsconfig <path>', 'Path to tsconfig.json', 'tsconfig.json')
  .option('--quiet', 'Only output issues, suppress summary', false)
  .option('--no-color', 'Disable color output')
  .action(async (scanPath: string | undefined, opts: Record<string, unknown>) => {
    try {
      const config = detectTenantShield(loadConfig(opts['config'] as string | undefined));

      const patternsRaw = opts['patterns'] as string | undefined;
      const patterns: PatternId[] | undefined = patternsRaw
        ? (patternsRaw.split(',').map((p) => p.trim()) as PatternId[])
        : undefined;

      const options: ScanOptions = {
        path: scanPath ?? '.',
        staged: Boolean(opts['staged']),
        failOn: ((opts['failOn'] as string) ?? 'high') as Severity | 'none',
        output: ((opts['output'] as string) ?? 'text') as OutputFormat,
        config: opts['config'] as string | undefined,
        patterns,
        tsconfig: (opts['tsconfig'] as string) ?? 'tsconfig.json',
        quiet: Boolean(opts['quiet']),
        noColor: !opts['color'] as boolean,
      };

      const { results, summary } = await scan(options, config);

      const reporter = createReporter(options.output, {
        noColor: options.noColor,
        quiet: options.quiet,
      });

      reporter.report(results, summary);

      if (shouldFail(summary, options.failOn)) {
        process.exitCode = 1;
        return;
      }
    } catch (err) {
      process.stderr.write(`[nestjs-leak-guard] Fatal error: ${err}\n`);
      process.exit(2);
    }
  });

program.parse(process.argv);
