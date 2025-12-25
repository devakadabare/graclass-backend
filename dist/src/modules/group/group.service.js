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
    async generateGroupCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existing = await this.prisma.studentGroup.findUnique({
                where: { groupCode: code },
            });
            if (!existing) {
                isUnique = true;
            }
        }
        return code;
    }
    async createGroup(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const groupCode = await this.generateGroupCode();
        const group = await this.prisma.studentGroup.create({
            data: {
                name: dto.name,
                description: dto.description,
                groupCode,
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
                approvedByOwner: true,
                approvedAt: new Date(),
            },
        });
        this.logger.log(`Student group created: ${group.name} by ${user.email} with code: ${groupCode}`);
        return group;
    }
    async searchByGroupCode(groupCode) {
        const group = await this.prisma.studentGroup.findUnique({
            where: { groupCode },
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });
        if (!group || !group.isActive) {
            throw new common_1.NotFoundException('Group not found or not active');
        }
        return {
            ...group,
            memberCount: group._count.members,
        };
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
                            members: true,
                        },
                    },
                },
            }),
            this.prisma.studentGroup.count({ where: { isActive: true } }),
        ]);
        return {
            data: groups.map((g) => ({
                ...g,
                memberCount: g._count.members,
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
                members: {
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
    async getGroupDetails(groupId, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const group = await this.prisma.studentGroup.findUnique({
            where: { id: groupId },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        university: true,
                        studentId: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                members: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                university: true,
                                studentId: true,
                                profileImage: true,
                                user: {
                                    select: {
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                courseEnrolls: {
                    where: {
                        status: client_1.EnrollmentStatus.APPROVED,
                    },
                    include: {
                        course: {
                            select: {
                                id: true,
                                name: true,
                                subject: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        members: true,
                        courseEnrolls: true,
                    },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const isCreator = group.createdBy === user.student.id;
        const userMembership = group.members.find((m) => m.studentId === user.student.id);
        const isMember = !!userMembership;
        const approvedMembers = group.members.filter((m) => m.status === client_1.EnrollmentStatus.APPROVED);
        const pendingMembers = group.members.filter((m) => m.status === client_1.EnrollmentStatus.PENDING);
        return {
            id: group.id,
            name: group.name,
            description: group.description,
            groupCode: group.groupCode,
            isActive: group.isActive,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            creator: group.creator,
            isCreator,
            isMember,
            membershipStatus: userMembership?.status || null,
            stats: {
                totalMembers: approvedMembers.length,
                pendingRequests: pendingMembers.length,
                enrolledCourses: group._count.courseEnrolls,
            },
            members: approvedMembers.map((m) => ({
                enrollmentId: m.id,
                joinedAt: m.approvedAt,
                student: {
                    id: m.student.id,
                    firstName: m.student.firstName,
                    lastName: m.student.lastName,
                    university: m.student.university,
                    studentId: m.student.studentId,
                    profileImage: m.student.profileImage,
                    email: m.student.user.email,
                },
            })),
            pendingRequests: isCreator
                ? pendingMembers.map((m) => ({
                    enrollmentId: m.id,
                    requestedAt: m.createdAt,
                    student: {
                        id: m.student.id,
                        firstName: m.student.firstName,
                        lastName: m.student.lastName,
                        university: m.student.university,
                        studentId: m.student.studentId,
                        profileImage: m.student.profileImage,
                        email: m.student.user.email,
                    },
                }))
                : [],
            enrolledCourses: group.courseEnrolls.map((ce) => ({
                id: ce.course.id,
                name: ce.course.name,
                subject: ce.course.subject,
                enrolledAt: ce.approvedAt,
            })),
        };
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
                        members: true,
                    },
                },
            },
        });
        return groups.map((g) => ({
            ...g,
            memberCount: g._count.members,
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
                                members: true,
                            },
                        },
                    },
                },
            },
        });
        return enrollments.map((e) => ({
            ...e.group,
            memberCount: e.group._count.members,
        }));
    }
    async joinGroupByCode(userId, groupCode) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const group = await this.prisma.studentGroup.findUnique({
            where: { groupCode },
        });
        if (!group || !group.isActive) {
            throw new common_1.NotFoundException('Group not found or not active');
        }
        const existing = await this.prisma.groupEnrollment.findUnique({
            where: {
                studentId_groupId: {
                    studentId: user.student.id,
                    groupId: group.id,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already a member or pending approval');
        }
        const enrollment = await this.prisma.groupEnrollment.create({
            data: {
                studentId: user.student.id,
                groupId: group.id,
                status: client_1.EnrollmentStatus.PENDING,
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        this.logger.log(`Student ${user.email} requested to join group: ${group.name}`);
        return enrollment;
    }
    async getPendingJoinRequests(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const requests = await this.prisma.groupEnrollment.findMany({
            where: {
                group: {
                    createdBy: user.student.id,
                },
                status: client_1.EnrollmentStatus.PENDING,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        university: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        groupCode: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return requests;
    }
    async approveJoinRequest(userId, enrollmentId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const enrollment = await this.prisma.groupEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                group: {
                    include: {
                        courseEnrolls: {
                            where: {
                                status: client_1.EnrollmentStatus.APPROVED,
                            },
                            select: {
                                courseId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Join request not found');
        }
        if (enrollment.group.createdBy !== user.student.id) {
            throw new common_1.ForbiddenException('Only group owner can approve join requests');
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING) {
            throw new common_1.BadRequestException('Request already processed');
        }
        const updated = await this.prisma.groupEnrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.EnrollmentStatus.APPROVED,
                approvedByOwner: true,
                approvedAt: new Date(),
            },
        });
        if (enrollment.group.courseEnrolls.length > 0) {
            const courseEnrollments = enrollment.group.courseEnrolls.map((ce) => ({
                studentId: enrollment.studentId,
                courseId: ce.courseId,
                groupEnrollmentId: enrollmentId,
                studentGroupId: enrollment.groupId,
                status: client_1.EnrollmentStatus.PENDING,
                approvedByLecturer: false,
            }));
            await this.prisma.studentCourseEnrollment.createMany({
                data: courseEnrollments,
            });
            this.logger.log(`Created ${courseEnrollments.length} pending course enrollments for student joining group`);
        }
        this.logger.log(`Group join request approved: ${enrollment.group.name} by ${user.email}`);
        return updated;
    }
    async rejectJoinRequest(userId, enrollmentId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const enrollment = await this.prisma.groupEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                group: true,
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Join request not found');
        }
        if (enrollment.group.createdBy !== user.student.id) {
            throw new common_1.ForbiddenException('Only group owner can reject join requests');
        }
        if (enrollment.status !== client_1.EnrollmentStatus.PENDING) {
            throw new common_1.BadRequestException('Request already processed');
        }
        const updated = await this.prisma.groupEnrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.EnrollmentStatus.REJECTED,
                rejectedAt: new Date(),
            },
        });
        this.logger.log(`Group join request rejected: ${enrollment.group.name} by ${user.email}`);
        return updated;
    }
    async removeMember(userId, enrollmentId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const enrollment = await this.prisma.groupEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                group: true,
                student: true,
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Group enrollment not found');
        }
        if (enrollment.group.createdBy !== user.student.id) {
            throw new common_1.ForbiddenException('Only group owner can remove members');
        }
        if (enrollment.studentId === enrollment.group.createdBy) {
            throw new common_1.BadRequestException('Cannot remove the group owner');
        }
        await this.prisma.groupEnrollment.delete({
            where: { id: enrollmentId },
        });
        this.logger.log(`Member removed from group: ${enrollment.student.firstName} ${enrollment.student.lastName} from ${enrollment.group.name} by ${user.email}`);
        return { message: 'Member successfully removed' };
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