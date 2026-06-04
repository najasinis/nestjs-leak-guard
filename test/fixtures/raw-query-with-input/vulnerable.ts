// ⚠️ 의도적으로 취약한 코드 — SQL Injection 위험
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class VulnerableSearchService {
  constructor(
    @InjectRepository(Object) private readonly repo: Repository<any>,
    private readonly dataSource: DataSource,
  ) {}

  // ❌ DETECT: 문자열 보간 → SQL Injection
  async search(name: string) {
    return this.repo.query(`SELECT * FROM students WHERE name = '${name}'`);
  }

  // ❌ DETECT: DataSource.query도 동일
  async findByEmail(email: string) {
    return this.dataSource.query(`SELECT * FROM users WHERE email = '${email}'`);
  }
}
