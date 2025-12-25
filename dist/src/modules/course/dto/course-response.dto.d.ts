export declare class CourseResponseDto {
    id: string;
    lecturerId: string;
    name: string;
    description?: string;
    subject: string;
    level?: string;
    duration: number;
    hourlyRate: number;
    flyer?: string;
    images?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
