// 🔕 이 파일은 테스트 픽스처입니다 — 검사 제외 마커 테스트용.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DisabledService {
  constructor(
    @InjectRepository(Object)
    private readonly repo: Repository<any>,
  ) {}

  async systemScan() {
    // nestjs-leak-guard-disable-next-line missing-tenant-filter
    return this.repo.find(); // 시스템 cron 작업 — 의도적
  }
}
