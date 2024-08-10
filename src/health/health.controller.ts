import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(protected readonly service: HealthService) {}

  @Get()
  async getOverAllServerHealth() {
    return this.service.getOverallServerHealth();
  }
}
