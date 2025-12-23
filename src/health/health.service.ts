import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: errorMessage,
      });
    }
  }

  async checkReadiness() {
    try {
      // Check if database is accessible
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not accessible',
      });
    }
  }

  checkLiveness() {
    // Simple liveness check - if this endpoint responds, the app is alive
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
