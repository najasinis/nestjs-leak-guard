// ⚠️ 이 파일은 nestjs-leak-guard의 e2e 검증용 예제입니다.
// 의도적으로 취약한 패턴을 포함합니다.
// `npx nestjs-leak-guard scan ./src` 실행 시 아래 이슈가 감지되어야 합니다:
//   - [HIGH] missing-tenant-filter @ findAll (line 24)
//   - [HIGH] raw-query-with-input @ searchByName (line 30)
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentsService {
  constructor(private readonly repo: any) {}

  // ❌ [HIGH] missing-tenant-filter: tenantId 없이 전체 조회
  async findAll() {
    return this.repo.find();
  }

  // ❌ [HIGH] raw-query-with-input: 문자열 보간 → SQL Injection
  async searchByName(name: string) {
    return this.repo.query(`SELECT * FROM students WHERE name LIKE '%${name}%'`);
  }

  // ✅ 안전: where에 tenantId 명시
  async findByTenant(tenantId: string) {
    return this.repo.find({ where: { tenantId } });
  }
}
