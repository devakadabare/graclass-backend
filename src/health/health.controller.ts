import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint for load balancers' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-12-23T10:30:00.000Z' },
        uptime: { type: 'number', example: 12345 },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.healthService.check();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for container orchestration' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  ready() {
    return this.healthService.checkReadiness();
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness check for container orchestration' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return this.healthService.checkLiveness();
  }
}
