import type { Reporter } from './index';
import type { ScanResult, ScanSummary } from '../types';

const LEVEL_MAP: Record<string, string> = {
  high: 'error',
  medium: 'warning',
  low: 'note',
};

export class SarifReporter implements Reporter {
  report(results: ScanResult[], _summary: ScanSummary): void {
    const ruleIds = [...new Set(results.map((r) => r.pattern))];

    const rules = ruleIds.map((id) => ({
      id,
      name: id,
      helpUri: `https://github.com/jinyeong-jung/nestjs-leak-guard/wiki/${id}`,
      shortDescription: { text: id.replace(/-/g, ' ') },
      defaultConfiguration: { level: 'warning' },
    }));

    const sarifResults = results.map((r) => ({
      ruleId: r.pattern,
      level: LEVEL_MAP[r.level] ?? 'warning',
      message: { text: `${r.message} — ${r.suggestion}` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: r.file.replace(/\\/g, '/'),
              uriBaseId: '%SRCROOT%',
            },
            region: { startLine: r.line, startColumn: r.column },
          },
        },
      ],
    }));

    const sarif = {
      $schema:
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'nestjs-leak-guard',
              version: '0.0.1',
              informationUri: 'https://github.com/jinyeong-jung/nestjs-leak-guard',
              rules,
            },
          },
          results: sarifResults,
        },
      ],
    };

    process.stdout.write(JSON.stringify(sarif, null, 2) + '\n');
  }
}
