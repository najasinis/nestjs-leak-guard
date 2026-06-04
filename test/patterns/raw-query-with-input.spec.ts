import { RawQueryWithInputPattern } from '../../src/patterns/raw-query-with-input';

describe('RawQueryWithInputPattern', () => {
  let pattern: RawQueryWithInputPattern;

  beforeEach(() => {
    pattern = new RawQueryWithInputPattern();
  });

  describe('취약한 코드 감지', () => {
    it.todo('템플릿 리터럴 보간이 있는 repo.query() → HIGH 결과');
    it.todo('DataSource.query() + 보간 → HIGH 결과');
    it.todo('결과의 suggestion에 파라미터화 예시 포함');
  });

  describe('안전한 코드 통과', () => {
    it.todo("파라미터화 쿼리 repo.query('...?', [param]) → 결과 없음");
    it.todo('상수 문자열만 사용 → 결과 없음');
  });

  describe('패턴 메타데이터', () => {
    it('id가 raw-query-with-input 이다', () => {
      expect(pattern.id).toBe('raw-query-with-input');
    });

    it('level이 high 이다', () => {
      expect(pattern.level).toBe('high');
    });
  });
});
