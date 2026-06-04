// ✅ 안전한 패턴 — 마스킹 헬퍼 사용
import { Injectable, Logger } from '@nestjs/common';

interface User {
  id: string;
  email: string;
  password: string;
}

function maskSensitive(value: string): string {
  return value.slice(0, 2) + '***';
}

@Injectable()
export class SafeAuthService {
  private readonly logger = new Logger(SafeAuthService.name);

  // ✅ 마스킹 후 로깅
  async login(user: User) {
    this.logger.log(`Login attempt for: ${user.email}`); // email은 민감 아님
    return user;
  }

  // ✅ 마스킹 헬퍼 사용
  async debugApiKey(apiKey: string) {
    this.logger.debug(`API key prefix: ${maskSensitive(apiKey)}`);
  }
}
