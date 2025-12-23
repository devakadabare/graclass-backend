"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthService = class HealthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: 'connected',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.ServiceUnavailableException({
                status: 'error',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: errorMessage,
            });
        }
    }
    async checkReadiness() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
            };
        }
        catch {
            throw new common_1.ServiceUnavailableException({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                reason: 'Database not accessible',
            });
        }
    }
    checkLiveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthService);
//# sourceMappingURL=health.service.js.map