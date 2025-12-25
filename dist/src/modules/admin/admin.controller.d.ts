import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserRole } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllUsers(page: number, limit: number, role?: UserRole, isActive?: boolean): Promise<{
        data: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            isEmailVerified: boolean;
            createdAt: Date;
            profile: {
                firstName: string;
                lastName: string;
                _count: {
                    courses: number;
                    classes: number;
                };
            } | {
                firstName: string;
                lastName: string;
                university: string | null;
                _count: {
                    courseEnrollments: number;
                };
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserById(id: string): Promise<{
        lecturer: ({
            _count: {
                courses: number;
                classes: number;
                availabilities: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            bio: string | null;
            qualifications: string | null;
            profilePicture: string | null;
            profileImage: string | null;
            userId: string;
        }) | null;
        student: ({
            _count: {
                courseEnrollments: number;
                individualClasses: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            profilePicture: string | null;
            profileImage: string | null;
            university: string | null;
            studentId: string | null;
            userId: string;
        }) | null;
    } & {
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<{
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSystemStats(): Promise<{
        overview: {
            totalUsers: number;
            totalLecturers: number;
            totalStudents: number;
            totalCourses: number;
            activeCourses: number;
            totalClasses: number;
            totalEnrollments: number;
            pendingEnrollments: number;
        };
        recentUsers: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        }[];
    }>;
    getAllCourses(page: number, limit: number): Promise<{
        data: ({
            lecturer: {
                user: {
                    email: string;
                };
                firstName: string;
                lastName: string;
            };
            _count: {
                classes: number;
                enrollments: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            subject: string;
            level: string | null;
            duration: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            flyer: string | null;
            lecturerId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAllEnrollments(page: number, limit: number, status?: string): Promise<{
        data: ({
            student: {
                user: {
                    email: string;
                };
                firstName: string;
                lastName: string;
            } | null;
            course: {
                name: string;
                subject: string;
            };
        } & {
            id: string;
            studentId: string | null;
            status: import(".prisma/client").$Enums.EnrollmentStatus;
            approvedAt: Date | null;
            rejectedAt: Date | null;
            requestedAt: Date;
            courseId: string;
            studentGroupId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
