import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      cors: {
        origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'not-set',
        configured: process.env.NODE_ENV === 'production' ? 'production' : 'development'
      }
    };
  }
}
