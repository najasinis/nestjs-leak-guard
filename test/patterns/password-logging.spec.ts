import { PasswordLoggingPattern } from '../../src/patterns/password-logging';

describe('PasswordLoggingPattern', () => {
  let pattern: PasswordLoggingPattern;

  beforeEach(() => {
    pattern = new PasswordLoggingPattern();
  });

  describe('취약한 코드 감지', () => {
    it.todo('console.log에 user.password 포함 → HIGH 결과');
    it.todo('NestJS Logger에 apiKey 포함 → HIGH 결과');
    it.todo('템플릿 리터럴 안에 password 필드 → HIGH 결과');
    it.todo('pwd, secret, token, privateKey 등 키워드도 감지');
  });

  describe('안전한 코드 통과', () => {
    it.todo('email 로깅 → 결과 없음');
    it.todo('maskSensitive(password) 후 로깅 → 결과 없음 (v0.2)');
  });

  describe('검사 제외 마커', () => {
    it.todo('disable-next-line 마커 → 결과 없음');
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
