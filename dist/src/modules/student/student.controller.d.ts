import { StudentService } from './student.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { EnrollmentStatus } from '@prisma/client';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    getMyProfile(userId: string): Promise<{
        profileImage: string | null;
        email: string;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        profilePicture: string | null;
        university: string | null;
        studentId: string | null;
        userId: string;
    }>;
    updateProfile(userId: string, dto: UpdateStudentProfileDto, file?: Express.Multer.File): Promise<{
        profileImage: string | undefined;
        email: string;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        profilePicture: string | null;
        university: string | null;
        studentId: string | null;
        userId: string;
    }>;
    enrollInCourse(userId: string, dto: EnrollCourseDto): Promise<{
        course: {
            lecturer: {
                firstName: string;
                lastName: string;
            };
            name: string;
            subject: string;
        };
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
    getMyEnrollments(userId: string, status?: EnrollmentStatus): Promise<({
        course: {
            id: string;
            lecturer: {
                id: string;
                firstName: string;
                lastName: string;
            };
            name: string;
            subject: string;
            level: string | null;
            duration: number;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        studentId: string | null;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        requestedAt: Date;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        courseId: string;
        studentGroupId: string | null;
    })[]>;
    getEnrolledCourses(userId: string): Promise<{
        enrollmentId: string;
        enrolledAt: Date | null;
        course: {
            totalClasses: number;
            lecturer: {
                id: string;
                firstName: string;
                lastName: string;
            };
            _count: {
                classes: number;
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
            flyer: string | null;
            lecturerId: string;
        };
    }[]>;
    getMyClasses(userId: string, upcoming?: boolean): Promise<({
        lecturer: {
            firstName: string;
            lastName: string;
        };
        course: {
            name: string;
            subject: string;
        };
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
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        location: string | null;
        meetingLink: string | null;
    })[]>;
}
