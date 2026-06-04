// ✅ 이 파일은 테스트 픽스처입니다 — 안전한 패턴을 포함합니다.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 케이스 1: where에 tenantId 직접 명시
@Injectable()
export class SafeWithWhereService {
  constructor(
    @InjectRepository(Object)
    private readonly repo: Repository<any>,
  ) {}

  async findAll(tenantId: string) {
    return this.repo.find({ where: { tenantId } });
  }
}

// 케이스 2: @RequireTenant() 적용 (tenantShield: true 설정 시 skip)
// @RequireTenant()  ← tenantShield 활성화 시 이 클래스는 skip됨
@Injectable()
export class SafeWithRequireTenantService {
  constructor(
    @InjectRepository(Object)
    private readonly repo: Repository<any>,
  ) {}

  async findAll() {
    return this.repo.find(); // tenantShield가 자동으로 WHERE를 주입하므로 안전
  }
}
