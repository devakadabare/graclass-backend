import { PrismaService } from '../prisma/prisma.service';
export declare class HealthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        database: string;
    }>;
    checkReadiness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    checkLiveness(): {
        status: string;
        timestamp: string;
    };
}
