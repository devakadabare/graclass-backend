import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        database: string;
    }>;
    ready(): Promise<{
        status: string;
        timestamp: string;
    }>;
    liveness(): {
        status: string;
        timestamp: string;
    };
}
