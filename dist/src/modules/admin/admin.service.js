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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(page = 1, limit = 20, role, isActive) {
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    lecturer: {
                        select: {
                            firstName: true,
                            lastName: true,
                            _count: {
                                select: {
                                    courses: true,
                                    classes: true,
                                },
                            },
                        },
                    },
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                            university: true,
                            _count: {
                                select: {
                                    courseEnrollments: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users.map((user) => ({
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                profile: user.lecturer || user.student,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                lecturer: {
                    include: {
                        _count: {
                            select: {
                                courses: true,
                                classes: true,
                                availabilities: true,
                            },
                        },
                    },
                },
                student: {
                    include: {
                        _count: {
                            select: {
                                courseEnrollments: true,
                                individualClasses: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUserStatus(userId, isActive) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
        this.logger.log(`User ${user.email} ${isActive ? 'activated' : 'deactivated'}`);
        return updated;
    }
    async getSystemStats() {
        const [totalUsers, totalLecturers, totalStudents, totalCourses, activeCourses, totalClasses, totalEnrollments, pendingEnrollments,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: client_1.UserRole.LECTURER } }),
            this.prisma.user.count({ where: { role: client_1.UserRole.STUDENT } }),
            this.prisma.course.count(),
            this.prisma.course.count({ where: { isActive: true } }),
            this.prisma.class.count(),
            this.prisma.courseEnrollment.count(),
            this.prisma.courseEnrollment.count({ where: { status: 'PENDING' } }),
        ]);
        const recentUsers = await this.prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        return {
            overview: {
                totalUsers,
                totalLecturers,
                totalStudents,
                totalCourses,
                activeCourses,
                totalClasses,
                totalEnrollments,
                pendingEnrollments,
            },
            recentUsers,
        };
    }
    async getAllCourses(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    lecturer: {
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
                    _count: {
                        select: {
                            enrollments: true,
                            classes: true,
                        },
                    },
                },
            }),
            this.prisma.course.count(),
        ]);
        return {
            data: courses,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAllEnrollments(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [enrollments, total] = await Promise.all([
            this.prisma.courseEnrollment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { requestedAt: 'desc' },
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
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.courseEnrollment.count({ where }),
        ]);
        return {
            data: enrollments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map