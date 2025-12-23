import { ClassStatus } from '@prisma/client';
export declare class UpdateClassDto {
    date?: string;
    startTime?: string;
    endTime?: string;
    meetingLink?: string;
    location?: string;
    status?: ClassStatus;
}
