import { PrismaService } from '../../prisma/prisma.service';
import { UpdateLecturerProfileDto } from './dto/update-lecturer-profile.dto';
export declare class LecturerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        email: string;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        bio: string | null;
        qualifications: string | null;
        profilePicture: string | null;
        userId: string;
    }>;
    getPublicProfile(lecturerId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        bio: string | null;
        qualifications: string | null;
        courses: {
            id: string;
            name: string;
            description: string | null;
            subject: string;
            level: string | null;
            duration: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    updateProfile(userId: string, dto: UpdateLecturerProfileDto): Promise<{
        email: string;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        bio: string | null;
        qualifications: string | null;
        profilePicture: string | null;
        userId: string;
    }>;
    getAllLecturers(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            bio: string | null;
            qualifications: string | null;
            coursesCount: number;
            classesCount: number;
            joinedDate: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
