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
var GroupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let GroupService = GroupService_1 = class GroupService {
    prisma;
    logger = new common_1.Logger(GroupService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createGroup(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const group = await this.prisma.studentGroup.create({
            data: {
                name: dto.name,
                description: dto.description,
                createdBy: user.student.id,
            },
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        await this.prisma.groupEnrollment.create({
            data: {
                studentId: user.student.id,
                groupId: group.id,
                status: client_1.EnrollmentStatus.APPROVED,
            },
        });
        this.logger.log(`Student group created: ${group.name} by ${user.email}`);
        return group;
    }
    async getAllGroups(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [groups, total] = await Promise.all([
            this.prisma.studentGroup.findMany({
                where: { isActive: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: {
                        select: {
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
            this.prisma.studentGroup.count({ where: { isActive: true } }),
        ]);
        return {
            data: groups.map((g) => ({
                ...g,
                memberCount: g._count.enrollments,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getGroupById(groupId) {
        const group = await this.prisma.studentGroup.findUnique({
            where: { id: groupId },
            include: {
                creator: {
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
                enrollments: {
                    where: { status: client_1.EnrollmentStatus.APPROVED },
                    include: {
                        student: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        return group;
    }
    async getMyGroups(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const groups = await this.prisma.studentGroup.findMany({
            where: { createdBy: user.student.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });
        return groups.map((g) => ({
            ...g,
            memberCount: g._count.enrollments,
        }));
    }
    async getJoinedGroups(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const enrollments = await this.prisma.groupEnrollment.findMany({
            where: {
                studentId: user.student.id,
                status: client_1.EnrollmentStatus.APPROVED,
            },
            include: {
                group: {
                    include: {
                        creator: {
                            select: {
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
                },
            },
        });
        return enrollments.map((e) => ({
            ...e.group,
            memberCount: e.group._count.enrollments,
        }));
    }
    async joinGroup(userId, groupId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const group = await this.prisma.studentGroup.findUnique({
            where: { id: groupId },
        });
        if (!group || !group.isActive) {
            throw new common_1.NotFoundException('Group not found or not active');
        }
        const existing = await this.prisma.groupEnrollment.findUnique({
            where: {
                studentId_groupId: {
                    studentId: user.student.id,
                    groupId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already a member or pending approval');
        }
        const enrollment = await this.prisma.groupEnrollment.create({
            data: {
                studentId: user.student.id,
                groupId,
                status: client_1.EnrollmentStatus.PENDING,
            },
        });
        this.logger.log(`Student ${user.email} requested to join group: ${group.name}`);
        return enrollment;
    }
    async updateGroup(userId, groupId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const group = await this.prisma.studentGroup.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.createdBy !== user.student.id) {
            throw new common_1.ForbiddenException('Only group creator can update the group');
        }
        const updated = await this.prisma.studentGroup.update({
            where: { id: groupId },
            data: dto,
        });
        this.logger.log(`Group updated: ${group.name} by ${user.email}`);
        return updated;
    }
    async deleteGroup(userId, groupId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const group = await this.prisma.studentGroup.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        if (group.createdBy !== user.student.id) {
            throw new common_1.ForbiddenException('Only group creator can delete the group');
        }
        await this.prisma.studentGroup.delete({
            where: { id: groupId },
        });
        this.logger.log(`Group deleted: ${group.name} by ${user.email}`);
        return { message: 'Group successfully deleted' };
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = GroupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupService);
//# sourceMappingURL=group.service.js.map