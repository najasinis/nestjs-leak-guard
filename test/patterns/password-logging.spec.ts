import { Project } from 'ts-morph';
import { PasswordLoggingPattern } from '../../src/patterns/password-logging';
import { DEFAULT_CONFIG } from '../../src/config';
import type { PatternContext } from '../../src/types';

function makeContext(code: string): PatternContext {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { skipLibCheck: true },
  });
  const sourceFile = project.createSourceFile('test.ts', code);
  return {
    filePath: 'test.ts',
    config: { ...DEFAULT_CONFIG },
    sourceFile,
    rawContent: code,
  };
}

describe('PasswordLoggingPattern', () => {
  let pattern: PasswordLoggingPattern;

  beforeEach(() => {
    pattern = new PasswordLoggingPattern();
  });

  describe('취약한 코드 감지', () => {
    it('console.log에 user.password 포함 → HIGH 결과', () => {
      const code = `
class Service {
  method(user: any) {
    console.log(user.password);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
      expect(results[0].pattern).toBe('password-logging');
    });

    it('NestJS Logger에 user.apiKey 포함 → HIGH 결과', () => {
      const code = `
class Service {
  method(user: any) {
    this.logger.warn(user.apiKey);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
      expect(results[0].level).toBe('high');
    });

    it('템플릿 리터럴 안에 password 필드 → HIGH 결과', () => {
      const code = `
class Service {
  method(user: any) {
    console.log(\`login failed for \${user.password}\`);
  }
}`;
      const results = pattern.analyze(makeContext(code));
      expect(results).toHaveLength(1);
    });

    it('pwd, secret, privateKey 키워드도 감지', () => {
      const cases = [
        `class S { m(u: any) { console.log(u.pwd); } }`,
        `class S { m(u: any) { console.log(u.secret); } }`,
        `class S { m(u: any) { console.log(u.privateKey); } }`,
      ];
      for (const code of cases) {
        expect(pattern.analyze(makeContext(code))).toHaveLength(1);
      }
    });

    it('결과에 suggestion 필드가 비어있지 않음', () => {
      const code = `class S { m(u: any) { console.log(u.password); } }`;
      expect(pattern.analyze(makeContext(code))[0].suggestion).toBeTruthy();
    });
  });

  describe('안전한 코드 통과', () => {
    it('email 로깅 → 결과 없음', () => {
      const code = `
class Service {
  method(user: any) {
    console.log(user.email);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });

    it('maskSensitive(user.password) — v0.1 현재는 감지됨 (v0.2에서 마스킹 함수 탐지 예정)', () => {
      // 현재 패턴은 인자 내부를 재귀 탐색하므로 마스킹 래퍼 안의 password도 감지됨.
      // v0.2에서 마스킹 함수 화이트리스트로 개선 예정.
      const code = `
class Service {
  method(user: any) {
    console.log(maskSensitive(user.password));
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(1);
    });
  });

  describe('검사 제외 마커', () => {
    it('disable-next-line 마커 → 결과 없음', () => {
      const code = `
class Service {
  method(user: any) {
    // nestjs-leak-guard-disable-next-line password-logging
    console.log(user.password);
  }
}`;
      expect(pattern.analyze(makeContext(code))).toHaveLength(0);
    });
  });

  describe('패턴 메타데이터', () => {
    it('id가 password-logging 이다', () => {
      expect(pattern.id).toBe('password-logging');
    });

    it('level이 high 이다', () => {
      expect(pattern.level).toBe('high');
    });
  });
});
