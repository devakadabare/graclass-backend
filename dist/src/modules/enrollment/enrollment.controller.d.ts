import { EnrollmentService } from './enrollment.service';
import { ApproveEnrollmentDto } from './dto/approve-enrollment.dto';
import { EnrollmentStatus } from '@prisma/client';
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
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
    getPendingCount(userId: string): Promise<{
        count: number;
    }>;
    getEnrollmentById(id: string, userId: string): Promise<{
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
    updateEnrollmentStatus(id: string, userId: string, dto: ApproveEnrollmentDto): Promise<{
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
}
