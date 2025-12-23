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
var ClassService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClassService = ClassService_1 = class ClassService {
    prisma;
    logger = new common_1.Logger(ClassService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createClass(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: dto.courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.lecturerId !== user.lecturer.id) {
            throw new common_1.ForbiddenException('You can only create classes for your own courses');
        }
        if (!dto.studentId && !dto.studentGroupId) {
            throw new common_1.BadRequestException('Either studentId or studentGroupId must be provided');
        }
        if (dto.studentId && dto.studentGroupId) {
            throw new common_1.BadRequestException('Cannot specify both studentId and studentGroupId');
        }
        if (dto.startTime >= dto.endTime) {
            throw new common_1.BadRequestException('startTime must be before endTime');
        }
        const classData = await this.prisma.class.create({
            data: {
                courseId: dto.courseId,
                lecturerId: user.lecturer.id,
                studentId: dto.studentId || null,
                studentGroupId: dto.studentGroupId || null,
                date: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
                meetingLink: dto.meetingLink,
                location: dto.location,
            },
        });
        this.logger.log(`Class created: ${course.name} on ${dto.date} by ${user.email}`);
        return classData;
    }
    async getLecturerClasses(userId, status, fromDate) {
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
        if (status) {
            where.status = status;
        }
        if (fromDate) {
            where.date = {
                gte: new Date(fromDate),
            };
        }
        const classes = await this.prisma.class.findMany({
            where,
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
        });
        return classes;
    }
    async getClassById(classId, userId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                course: {
                    select: {
                        name: true,
                        subject: true,
                        level: true,
                        duration: true,
                    },
                },
                lecturer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        userId: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        userId: true,
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
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        if (userId) {
            const hasAccess = classData.lecturer.userId === userId ||
                classData.student?.userId === userId;
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have permission to view this class');
            }
        }
        return classData;
    }
    async updateClass(classId, userId, dto) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                lecturer: {
                    include: { user: true },
                },
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        if (classData.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this class');
        }
        if (dto.startTime || dto.endTime) {
            const newStartTime = dto.startTime || classData.startTime;
            const newEndTime = dto.endTime || classData.endTime;
            if (newStartTime >= newEndTime) {
                throw new common_1.BadRequestException('startTime must be before endTime');
            }
        }
        const updateData = {};
        if (dto.date)
            updateData.date = new Date(dto.date);
        if (dto.startTime)
            updateData.startTime = dto.startTime;
        if (dto.endTime)
            updateData.endTime = dto.endTime;
        if (dto.meetingLink !== undefined)
            updateData.meetingLink = dto.meetingLink;
        if (dto.location !== undefined)
            updateData.location = dto.location;
        if (dto.status)
            updateData.status = dto.status;
        const updated = await this.prisma.class.update({
            where: { id: classId },
            data: updateData,
        });
        this.logger.log(`Class updated by ${classData.lecturer.user.email}: ${classId}`);
        return updated;
    }
    async cancelClass(classId, userId) {
        return this.updateClass(classId, userId, { status: 'CANCELLED' });
    }
    async deleteClass(classId, userId) {
        const classData = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                lecturer: {
                    include: { user: true },
                },
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        if (classData.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this class');
        }
        await this.prisma.class.delete({
            where: { id: classId },
        });
        this.logger.log(`Class deleted by ${classData.lecturer.user.email}: ${classId}`);
        return { message: 'Class successfully deleted' };
    }
};
exports.ClassService = ClassService;
exports.ClassService = ClassService = ClassService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassService);
//# sourceMappingURL=class.service.js.map