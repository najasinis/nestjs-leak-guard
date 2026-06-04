// ⚠️ 이 파일은 테스트 픽스처입니다 — 의도적으로 취약한 코드를 포함합니다.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VulnerableStudentsService {
  constructor(
    @InjectRepository(Object)
    private readonly repo: Repository<any>,
  ) {}

  // ❌ DETECT: tenantId 조건 없이 전체 조회
  async findAll() {
    return this.repo.find();
  }

  // ❌ DETECT: where에 tenantId 없음
  async findByGrade(grade: number) {
    return this.repo.find({ where: { grade } });
  }

  // ❌ DETECT: count도 tenantId 없으면 위험
  async countStudents() {
    return this.repo.count();
  }
}
