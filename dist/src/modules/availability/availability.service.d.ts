import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
export declare class AvailabilityService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createAvailability(userId: string, dto: CreateAvailabilityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lecturerId: string;
        startTime: string;
        endTime: string;
        isRecurring: boolean;
        dayOfWeek: number | null;
        specificDate: Date | null;
    }>;
    getLecturerAvailability(userId: string, includeExpired?: boolean): Promise<{
        dayName: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lecturerId: string;
        startTime: string;
        endTime: string;
        isRecurring: boolean;
        dayOfWeek: number | null;
        specificDate: Date | null;
    }[]>;
    getPublicAvailability(lecturerId: string): Promise<{
        id: string;
        isRecurring: boolean;
        dayOfWeek: number | null;
        dayName: string | null;
        specificDate: Date | null;
        startTime: string;
        endTime: string;
    }[]>;
    updateAvailability(availabilityId: string, userId: string, dto: UpdateAvailabilityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lecturerId: string;
        startTime: string;
        endTime: string;
        isRecurring: boolean;
        dayOfWeek: number | null;
        specificDate: Date | null;
    }>;
    deleteAvailability(availabilityId: string, userId: string): Promise<{
        message: string;
    }>;
    private getDayName;
}
