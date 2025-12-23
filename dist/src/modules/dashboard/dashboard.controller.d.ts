import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getLecturerDashboard(userId: string): Promise<{
        overview: {
            totalCourses: number;
            activeCourses: number;
            totalClasses: number;
            totalStudents: number;
            totalEarnings: string;
            thisMonthEarnings: string;
        };
        classes: {
            upcoming: number;
            completed: number;
            cancelled: number;
            thisMonth: number;
            thisWeek: number;
        };
        recentActivity: {
            enrollments: {
                courseName: string;
                studentName: string | null;
                groupName: string | null;
                status: import(".prisma/client").$Enums.EnrollmentStatus;
                enrolledAt: Date;
            }[];
        };
        upcomingSchedule: {
            id: string;
            courseName: string;
            subject: string;
            studentName: string | null;
            groupName: string | null;
            classDate: Date;
            startTime: string;
            endTime: string;
            meetingLink: string | null;
            location: string | null;
        }[];
    }>;
    getCourseStatistics(userId: string): Promise<{
        id: string;
        name: string;
        subject: string;
        level: string | null;
        isActive: boolean;
        totalEnrollments: number;
        totalClasses: number;
        completedClasses: number;
        hourlyRate: number;
    }[]>;
    getStudentDashboard(userId: string): Promise<{
        overview: {
            totalEnrollments: number;
            approvedEnrollments: number;
            pendingEnrollments: number;
            totalClasses: number;
        };
        classes: {
            upcoming: number;
            completed: number;
        };
        enrolledCourses: {
            courseName: string;
            subject: string;
            level: string | null;
            lecturer: string;
            enrolledAt: Date | null;
        }[];
        upcomingSchedule: {
            id: string;
            courseName: string;
            subject: string;
            lecturer: string;
            classDate: Date;
            startTime: string;
            endTime: string;
            meetingLink: string | null;
            location: string | null;
        }[];
    }>;
}
