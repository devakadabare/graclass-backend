"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = DashboardService_1 = class DashboardService {
    prisma;
    logger = new common_1.Logger(DashboardService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLecturerDashboard(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const lecturerId = user.lecturer.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const [totalCourses, activeCourses, totalClasses, upcomingClasses, completedClasses, cancelledClasses, totalStudents, thisMonthClasses, thisWeekClasses, recentEnrollments, upcomingSchedule,] = await Promise.all([
            this.prisma.course.count({
                where: { lecturerId },
            }),
            this.prisma.course.count({
                where: { lecturerId, isActive: true },
            }),
            this.prisma.class.count({
                where: { lecturerId },
            }),
            this.prisma.class.count({
                where: {
                    lecturerId,
                    status: 'SCHEDULED',
                    date: { gte: now },
                },
            }),
            this.prisma.class.count({
                where: {
                    lecturerId,
                    status: 'COMPLETED',
                },
            }),
            this.prisma.class.count({
                where: {
                    lecturerId,
                    status: 'CANCELLED',
                },
            }),
            this.prisma.courseEnrollment
                .findMany({
                where: {
                    course: { lecturerId },
                    studentId: { not: null },
                },
                select: { studentId: true },
                distinct: ['studentId'],
            })
                .then((enrollments) => enrollments.length),
            this.prisma.class.count({
                where: {
                    lecturerId,
                    date: { gte: startOfMonth },
                },
            }),
            this.prisma.class.count({
                where: {
                    lecturerId,
                    date: { gte: startOfWeek },
                },
            }),
            this.prisma.courseEnrollment.findMany({
                where: {
                    course: { lecturerId },
                },
                take: 10,
                orderBy: { requestedAt: 'desc' },
                include: {
                    course: {
                        select: { name: true },
                    },
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    studentGroup: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.class.findMany({
                where: {
                    lecturerId,
                    status: 'SCHEDULED',
                    date: {
                        gte: now,
                        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                take: 10,
                orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
                include: {
                    course: {
                        select: {
                            name: true,
                            subject: true,
                        },
                    },
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    studentGroup: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
        ]);
        const earningsData = await this.prisma.class.findMany({
            where: {
                lecturerId,
                status: 'COMPLETED',
            },
            include: {
                course: {
                    select: {
                        hourlyRate: true,
                        duration: true,
                    },
                },
            },
        });
        const totalEarnings = earningsData.reduce((sum, classData) => {
            const hours = classData.course.duration / 60;
            const rate = Number(classData.course.hourlyRate);
            return sum + hours * rate;
        }, 0);
        const thisMonthEarnings = earningsData
            .filter((c) => c.date >= startOfMonth)
            .reduce((sum, classData) => {
            const hours = classData.course.duration / 60;
            const rate = Number(classData.course.hourlyRate);
            return sum + hours * rate;
        }, 0);
        return {
            overview: {
                totalCourses,
                activeCourses,
                totalClasses,
                totalStudents,
                totalEarnings: totalEarnings.toFixed(2),
                thisMonthEarnings: thisMonthEarnings.toFixed(2),
            },
            classes: {
                upcoming: upcomingClasses,
                completed: completedClasses,
                cancelled: cancelledClasses,
                thisMonth: thisMonthClasses,
                thisWeek: thisWeekClasses,
            },
            recentActivity: {
                enrollments: recentEnrollments.map((e) => ({
                    courseName: e.course.name,
                    studentName: e.student
                        ? `${e.student.firstName} ${e.student.lastName}`
                        : null,
                    groupName: e.studentGroup?.name || null,
                    status: e.status,
                    enrolledAt: e.requestedAt,
                })),
            },
            upcomingSchedule: upcomingSchedule.map((c) => ({
                id: c.id,
                courseName: c.course.name,
                subject: c.course.subject,
                studentName: c.student
                    ? `${c.student.firstName} ${c.student.lastName}`
                    : null,
                groupName: c.studentGroup?.name || null,
                classDate: c.date,
                startTime: c.startTime,
                endTime: c.endTime,
                meetingLink: c.meetingLink,
                location: c.location,
            })),
        };
    }
    async getCourseStatistics(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const courses = await this.prisma.course.findMany({
            where: { lecturerId: user.lecturer.id },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        classes: true,
                    },
                },
                classes: {
                    where: { status: 'COMPLETED' },
                    select: {
                        id: true,
                    },
                },
            },
        });
        return courses.map((course) => ({
            id: course.id,
            name: course.name,
            subject: course.subject,
            level: course.level,
            isActive: course.isActive,
            totalEnrollments: course._count.enrollments,
            totalClasses: course._count.classes,
            completedClasses: course.classes.length,
            hourlyRate: Number(course.hourlyRate),
        }));
    }
    async getStudentDashboard(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const studentId = user.student.id;
        const now = new Date();
        const [totalEnrollments, approvedEnrollments, pendingEnrollments, totalClasses, upcomingClasses, completedClasses, upcomingSchedule,] = await Promise.all([
            this.prisma.courseEnrollment.count({
                where: { studentId },
            }),
            this.prisma.courseEnrollment.count({
                where: { studentId, status: 'APPROVED' },
            }),
            this.prisma.courseEnrollment.count({
                where: { studentId, status: 'PENDING' },
            }),
            this.prisma.class.count({
                where: { studentId },
            }),
            this.prisma.class.count({
                where: {
                    studentId,
                    status: 'SCHEDULED',
                    date: { gte: now },
                },
            }),
            this.prisma.class.count({
                where: {
                    studentId,
                    status: 'COMPLETED',
                },
            }),
            this.prisma.class.findMany({
                where: {
                    studentId,
                    status: 'SCHEDULED',
                    date: {
                        gte: now,
                        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                take: 10,
                orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
                include: {
                    course: {
                        select: {
                            name: true,
                            subject: true,
                        },
                    },
                    lecturer: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
        ]);
        const enrolledCourses = await this.prisma.courseEnrollment.findMany({
            where: {
                studentId,
                status: 'APPROVED',
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        subject: true,
                        level: true,
                        lecturer: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            overview: {
                totalEnrollments,
                approvedEnrollments,
                pendingEnrollments,
                totalClasses,
            },
            classes: {
                upcoming: upcomingClasses,
                completed: completedClasses,
            },
            enrolledCourses: enrolledCourses.map((e) => ({
                courseName: e.course.name,
                subject: e.course.subject,
                level: e.course.level,
                lecturer: `${e.course.lecturer.firstName} ${e.course.lecturer.lastName}`,
                enrolledAt: e.approvedAt,
            })),
            upcomingSchedule: upcomingSchedule.map((c) => ({
                id: c.id,
                courseName: c.course.name,
                subject: c.course.subject,
                lecturer: `${c.lecturer.firstName} ${c.lecturer.lastName}`,
                classDate: c.date,
                startTime: c.startTime,
                endTime: c.endTime,
                meetingLink: c.meetingLink,
                location: c.location,
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map