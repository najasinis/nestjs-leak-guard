// ⚠️ 의도적으로 취약한 코드 — 민감 정보 로깅
import { Injectable, Logger } from '@nestjs/common';

interface User {
  id: string;
  email: string;
  password: string;
}

@Injectable()
export class VulnerableAuthService {
  private readonly logger = new Logger(VulnerableAuthService.name);

  // ❌ DETECT: password 필드 직접 로깅
  async login(user: User) {
    console.log(`Login attempt: ${user.password}`);
    return user;
  }

  // ❌ DETECT: NestJS Logger에 secret 포함
  async setApiKey(apiKey: string) {
    this.logger.log(`Setting API key: ${apiKey}`);
  }

  // ❌ DETECT: 객체에 password 속성 전달
  async register(user: User) {
    console.log(user.password);
  }
}
