// ⚠️ 이 파일은 nestjs-leak-guard의 e2e 검증용 예제입니다.
// `npx nestjs-leak-guard scan ./src` 실행 시 아래 이슈가 감지되어야 합니다:
//   - [HIGH] password-logging @ login (line 16)
//   - [HIGH] env-logging @ getConfig (line 22)
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // ❌ [HIGH] password-logging: 비밀번호 로깅
  async login(email: string, password: string) {
    console.log(`Login attempt: email=${email}, password=${password}`);
    return { success: true };
  }

  // ❌ [HIGH] env-logging: 환경변수 로깅
  getConfig() {
    this.logger.log(`DB connection: ${process.env.DATABASE_URL}`);
    return {};
  }
}
