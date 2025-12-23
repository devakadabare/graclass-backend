import { LecturerService } from './lecturer.service';
import { UpdateLecturerProfileDto } from './dto/update-lecturer-profile.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
export declare class LecturerController {
    private readonly lecturerService;
    constructor(lecturerService: LecturerService);
    getMyProfile(userId: string): Promise<{
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
    getAllLecturers(page: number, limit: number): Promise<{
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
    createStudent(lecturerId: string, dto: CreateStudentDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        university: string | null;
        studentId: string | null;
    }>;
    createEnrollment(lecturerId: string, dto: CreateEnrollmentDto): Promise<{
        student: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        course: {
            name: string;
            subject: string;
        };
        studentGroup: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        studentId: string | null;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        requestedAt: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        courseId: string;
        studentGroupId: string | null;
    }>;
}
