import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createClass(userId: string, dto: CreateClassDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string | null;
        lecturerId: string;
        status: import(".prisma/client").$Enums.ClassStatus;
        courseId: string;
        studentGroupId: string | null;
        type: import(".prisma/client").$Enums.ClassType;
        date: Date;
        startTime: string;
        endTime: string;
        location: string | null;
        meetingLink: string | null;
        notes: string | null;
    }>;
    getLecturerClasses(userId: string, status?: string, fromDate?: string): Promise<({
        student: {
            firstName: string;
            lastName: string;
        } | null;
        course: {
            name: string;
            subject: string;
        };
        studentGroup: {
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string | null;
        lecturerId: string;
        status: import(".prisma/client").$Enums.ClassStatus;
        courseId: string;
        studentGroupId: string | null;
        type: import(".prisma/client").$Enums.ClassType;
        date: Date;
        startTime: string;
        endTime: string;
        location: string | null;
        meetingLink: string | null;
        notes: string | null;
    })[]>;
    getClassById(classId: string, userId?: string): Promise<{
        lecturer: {
            id: string;
            firstName: string;
            lastName: string;
            userId: string;
        };
        student: {
            id: string;
            firstName: string;
            lastName: string;
            userId: string;
        } | null;
        course: {
            name: string;
            subject: string;
            level: string | null;
            duration: number;
        };
        studentGroup: {
            id: string;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string | null;
        lecturerId: string;
        status: import(".prisma/client").$Enums.ClassStatus;
        courseId: string;
        studentGroupId: string | null;
        type: import(".prisma/client").$Enums.ClassType;
        date: Date;
        startTime: string;
        endTime: string;
        location: string | null;
        meetingLink: string | null;
        notes: string | null;
    }>;
    updateClass(classId: string, userId: string, dto: UpdateClassDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string | null;
        lecturerId: string;
        status: import(".prisma/client").$Enums.ClassStatus;
        courseId: string;
        studentGroupId: string | null;
        type: import(".prisma/client").$Enums.ClassType;
        date: Date;
        startTime: string;
        endTime: string;
        location: string | null;
        meetingLink: string | null;
        notes: string | null;
    }>;
    cancelClass(classId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string | null;
        lecturerId: string;
        status: import(".prisma/client").$Enums.ClassStatus;
        courseId: string;
        studentGroupId: string | null;
        type: import(".prisma/client").$Enums.ClassType;
        date: Date;
        startTime: string;
        endTime: string;
        location: string | null;
        meetingLink: string | null;
        notes: string | null;
    }>;
    deleteClass(classId: string, userId: string): Promise<{
        message: string;
    }>;
}
