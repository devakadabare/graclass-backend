import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
export declare class EnrollmentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getLecturerEnrollments(userId: string, status?: EnrollmentStatus, courseId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        requestedAt: Date;
        approvedAt: Date | null;
        course: {
            id: string;
            name: string;
            subject: string;
        };
        student: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        } | null;
        studentGroup: {
            id: string;
            name: string;
            description: string | null;
        } | null;
    }[]>;
    getPendingEnrollmentsCount(userId: string): Promise<{
        count: number;
    }>;
    updateEnrollmentStatus(enrollmentId: string, userId: string, status: EnrollmentStatus): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        requestedAt: Date;
        approvedAt: Date | null;
        course: {
            name: string;
        };
        student: {
            firstName: string;
            lastName: string;
        } | null;
        studentGroup: {
            name: string;
        } | null;
    }>;
    getEnrollmentById(enrollmentId: string, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        requestedAt: Date;
        approvedAt: Date | null;
        course: {
            id: string;
            name: string;
            subject: string;
            level: string | null;
        };
        student: {
            email: string;
            id: string;
            user: {
                email: string;
            };
            firstName: string;
            lastName: string;
            phone: string | null;
            university: string | null;
            studentId: string | null;
        } | null;
        studentGroup: {
            id: string;
            name: string;
            description: string | null;
        } | null;
    }>;
}
