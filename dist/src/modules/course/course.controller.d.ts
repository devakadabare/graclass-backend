import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    createCourse(userId: string, dto: CreateCourseDto): Promise<{
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
        lecturerId: string;
    }>;
    getMyCourses(userId: string, includeInactive: boolean): Promise<{
        enrollmentsCount: number;
        classesCount: number;
        _count: {
            classes: number;
            enrollments: number;
        };
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
        lecturerId: string;
    }[]>;
    searchCourses(subject?: string, level?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            description: string | null;
            subject: string;
            level: string | null;
            duration: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            lecturer: {
                id: string;
                firstName: string;
                lastName: string;
            };
            enrollmentsCount: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCourseById(id: string, userId?: string): Promise<{
        enrollmentsCount: number;
        classesCount: number;
        isOwner: boolean;
        lecturer: {
            user: {
                email: string;
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
            userId: string;
        };
        _count: {
            classes: number;
            enrollments: number;
        };
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
        lecturerId: string;
    } | {
        id: string;
        name: string;
        description: string | null;
        subject: string;
        level: string | null;
        duration: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        lecturer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        enrollmentsCount: number;
        classesCount: number;
        isOwner: boolean;
    }>;
    updateCourse(id: string, userId: string, dto: UpdateCourseDto): Promise<{
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
        lecturerId: string;
    }>;
    deleteCourse(id: string, userId: string): Promise<{
        message: string;
    }>;
}
