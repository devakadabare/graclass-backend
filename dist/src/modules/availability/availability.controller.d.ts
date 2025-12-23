import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
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
    getMyAvailability(userId: string, includeExpired: boolean): Promise<{
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
    updateAvailability(id: string, userId: string, dto: UpdateAvailabilityDto): Promise<{
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
    deleteAvailability(id: string, userId: string): Promise<{
        message: string;
    }>;
}
