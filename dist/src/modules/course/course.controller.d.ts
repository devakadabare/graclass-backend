import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    createCourse(userId: string, dto: CreateCourseDto, files?: {
        flyer?: Express.Multer.File[];
        images?: Express.Multer.File[];
    }): Promise<{
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            order: number;
            courseId: string;
        }[];
    } & {
        id: string;
        lecturerId: string;
        name: string;
        description: string | null;
        subject: string;
        level: string | null;
        duration: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        flyer: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyCourses(userId: string, includeInactive: boolean): Promise<{
        enrollmentsCount: number;
        classesCount: number;
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            order: number;
            courseId: string;
        }[];
        _count: {
            classes: number;
            enrollments: number;
        };
        id: string;
        lecturerId: string;
        name: string;
        description: string | null;
        subject: string;
        level: string | null;
        duration: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        flyer: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
            flyer: string | null;
            images: {
                id: string;
                createdAt: Date;
                imageUrl: string;
                order: number;
                courseId: string;
            }[];
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
        flyer: string | null;
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            order: number;
            courseId: string;
        }[];
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
            userId: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            bio: string | null;
            qualifications: string | null;
            profilePicture: string | null;
            profileImage: string | null;
        };
        _count: {
            classes: number;
            enrollments: number;
        };
        id: string;
        lecturerId: string;
        name: string;
        description: string | null;
        subject: string;
        level: string | null;
        duration: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | {
        id: string;
        name: string;
        description: string | null;
        subject: string;
        level: string | null;
        duration: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        flyer: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            order: number;
            courseId: string;
        }[];
        lecturer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        enrollmentsCount: number;
        classesCount: number;
        isOwner: boolean;
    }>;
    updateCourse(id: string, userId: string, dto: UpdateCourseDto, files?: {
        flyer?: Express.Multer.File[];
        images?: Express.Multer.File[];
    }): Promise<{
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            order: number;
            courseId: string;
        }[];
    } & {
        id: string;
        lecturerId: string;
        name: string;
        description: string | null;
        subject: string;
        level: string | null;
        duration: number;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        flyer: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCourse(id: string, userId: string): Promise<{
        message: string;
    }>;
}
