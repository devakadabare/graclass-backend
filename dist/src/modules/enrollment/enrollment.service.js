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
var EnrollmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EnrollmentService = EnrollmentService_1 = class EnrollmentService {
    prisma;
    logger = new common_1.Logger(EnrollmentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLecturerEnrollments(userId, status, courseId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const where = {
            course: {
                lecturerId: user.lecturer.id,
            },
        };
        if (status) {
            where.status = status;
        }
        if (courseId) {
            where.courseId = courseId;
        }
        const enrollments = await this.prisma.courseEnrollment.findMany({
            where,
            orderBy: {
                requestedAt: 'desc',
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        subject: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                studentGroup: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
        });
        return enrollments.map((e) => ({
            id: e.id,
            status: e.status,
            requestedAt: e.requestedAt,
            approvedAt: e.approvedAt,
            course: e.course,
            student: e.student
                ? {
                    id: e.student.id,
                    firstName: e.student.firstName,
                    lastName: e.student.lastName,
                    email: e.student.user.email,
                }
                : null,
            studentGroup: e.studentGroup,
        }));
    }
    async getPendingEnrollmentsCount(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const count = await this.prisma.courseEnrollment.count({
            where: {
                course: {
                    lecturerId: user.lecturer.id,
                },
                status: client_1.EnrollmentStatus.PENDING,
            },
        });
        return { count };
    }
    async updateEnrollmentStatus(enrollmentId, userId, status) {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        lecturer: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                studentGroup: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.course.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to manage this enrollment');
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING) {
            throw new common_1.BadRequestException(`Enrollment has already been ${enrollment.status.toLowerCase()}`);
        }
        const updated = await this.prisma.courseEnrollment.update({
            where: { id: enrollmentId },
            data: {
                status,
                approvedAt: status === client_1.EnrollmentStatus.APPROVED ? new Date() : null,
            },
            include: {
                course: {
                    select: {
                        name: true,
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
        });
        const studentIdentifier = enrollment.student
            ? `${enrollment.student.firstName} ${enrollment.student.lastName} (${enrollment.student.user.email})`
            : `Group: ${enrollment.studentGroup?.name}`;
        this.logger.log(`Enrollment ${status.toLowerCase()}: ${studentIdentifier} for course "${enrollment.course.name}" by ${enrollment.course.lecturer.user.email}`);
        return {
            id: updated.id,
            status: updated.status,
            requestedAt: updated.requestedAt,
            approvedAt: updated.approvedAt,
            course: updated.course,
            student: updated.student,
            studentGroup: updated.studentGroup,
        };
    }
    async getEnrollmentById(enrollmentId, userId) {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        lecturer: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        university: true,
                        studentId: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                studentGroup: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.course.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this enrollment');
        }
        return {
            id: enrollment.id,
            status: enrollment.status,
            requestedAt: enrollment.requestedAt,
            approvedAt: enrollment.approvedAt,
            course: {
                id: enrollment.course.id,
                name: enrollment.course.name,
                subject: enrollment.course.subject,
                level: enrollment.course.level,
            },
            student: enrollment.student
                ? {
                    ...enrollment.student,
                    email: enrollment.student.user.email,
                }
                : null,
            studentGroup: enrollment.studentGroup,
        };
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = EnrollmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map