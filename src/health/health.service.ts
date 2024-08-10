import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  constructor() {}

  async getOverallServerHealth() {
    return {
      message: 'OK',
    };
  }
}
