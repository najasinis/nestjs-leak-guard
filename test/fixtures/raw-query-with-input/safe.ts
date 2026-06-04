// ✅ 안전한 패턴 — 파라미터화 쿼리
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SafeSearchService {
  constructor(
    @InjectRepository(Object) private readonly repo: Repository<any>,
  ) {}

  // ✅ 파라미터화 쿼리 — SQL Injection 안전
  async search(name: string) {
    return this.repo.query('SELECT * FROM students WHERE name = ?', [name]);
  }

  // ✅ 상수 문자열만 사용
  async findAll() {
    return this.repo.query('SELECT * FROM students ORDER BY created_at DESC');
  }
}
