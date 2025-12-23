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
var CourseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CourseService = CourseService_1 = class CourseService {
    prisma;
    logger = new common_1.Logger(CourseService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCourse(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const course = await this.prisma.course.create({
            data: {
                lecturerId: user.lecturer.id,
                name: dto.name,
                description: dto.description,
                subject: dto.subject,
                level: dto.level,
                duration: dto.duration,
                hourlyRate: dto.hourlyRate,
            },
        });
        this.logger.log(`Course created: ${course.name} by ${user.email}`);
        return course;
    }
    async getLecturerCourses(userId, includeInactive = false) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const where = {
            lecturerId: user.lecturer.id,
        };
        if (!includeInactive) {
            where.isActive = true;
        }
        const courses = await this.prisma.course.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        classes: true,
                    },
                },
            },
        });
        return courses.map((course) => ({
            ...course,
            enrollmentsCount: course._count.enrollments,
            classesCount: course._count.classes,
        }));
    }
    async getCourseById(courseId, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lecturer: {
                    include: {
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
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { lecturer: true },
            });
            if (user?.lecturer?.id === course.lecturerId) {
                return {
                    ...course,
                    enrollmentsCount: course._count.enrollments,
                    classesCount: course._count.classes,
                    isOwner: true,
                };
            }
        }
        return {
            id: course.id,
            name: course.name,
            description: course.description,
            subject: course.subject,
            level: course.level,
            duration: course.duration,
            hourlyRate: course.hourlyRate,
            lecturer: {
                id: course.lecturer.id,
                firstName: course.lecturer.firstName,
                lastName: course.lecturer.lastName,
            },
            enrollmentsCount: course._count.enrollments,
            classesCount: course._count.classes,
            isOwner: false,
        };
    }
    async updateCourse(courseId, userId, dto) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lecturer: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this course');
        }
        const updatedCourse = await this.prisma.course.update({
            where: { id: courseId },
            data: dto,
        });
        this.logger.log(`Course updated: ${updatedCourse.name} by ${course.lecturer.user.email}`);
        return updatedCourse;
    }
    async deleteCourse(courseId, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lecturer: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this course');
        }
        await this.prisma.course.update({
            where: { id: courseId },
            data: { isActive: false },
        });
        this.logger.log(`Course deactivated: ${course.name} by ${course.lecturer.user.email}`);
        return { message: 'Course successfully deactivated' };
    }
    async searchCourses(params) {
        const { subject, level, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
        };
        if (subject) {
            where.subject = {
                contains: subject,
                mode: 'insensitive',
            };
        }
        if (level) {
            where.level = {
                contains: level,
                mode: 'insensitive',
            };
        }
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    lecturer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: {
                            enrollments: true,
                        },
                    },
                },
            }),
            this.prisma.course.count({ where }),
        ]);
        return {
            data: courses.map((course) => ({
                id: course.id,
                name: course.name,
                description: course.description,
                subject: course.subject,
                level: course.level,
                duration: course.duration,
                hourlyRate: course.hourlyRate,
                lecturer: course.lecturer,
                enrollmentsCount: course._count.enrollments,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = CourseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseService);
//# sourceMappingURL=course.service.js.map