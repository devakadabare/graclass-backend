import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { S3Service } from '../../common/services/s3.service';
export declare class CourseService {
    private readonly prisma;
    private readonly s3Service;
    private readonly logger;
    constructor(prisma: PrismaService, s3Service: S3Service);
    createCourse(userId: string, dto: CreateCourseDto, flyer?: Express.Multer.File, images?: Express.Multer.File[]): Promise<{
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
    getLecturerCourses(userId: string, includeInactive?: boolean): Promise<{
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
    getCourseById(courseId: string, userId?: string): Promise<{
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
    updateCourse(courseId: string, userId: string, dto: UpdateCourseDto, flyer?: Express.Multer.File, images?: Express.Multer.File[]): Promise<{
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
    deleteCourse(courseId: string, userId: string): Promise<{
        message: string;
    }>;
    searchCourses(params: {
        subject?: string;
        level?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
}
