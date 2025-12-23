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
var LecturerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LecturerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LecturerService = LecturerService_1 = class LecturerService {
    prisma;
    logger = new common_1.Logger(LecturerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                lecturer: true,
            },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        return {
            ...user.lecturer,
            email: user.email,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async getPublicProfile(lecturerId) {
        const lecturer = await this.prisma.lecturer.findUnique({
            where: { id: lecturerId },
            include: {
                user: {
                    select: {
                        email: true,
                        isActive: true,
                    },
                },
                courses: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        subject: true,
                        level: true,
                        hourlyRate: true,
                        duration: true,
                    },
                },
            },
        });
        if (!lecturer) {
            throw new common_1.NotFoundException('Lecturer not found');
        }
        if (!lecturer.user.isActive) {
            throw new common_1.NotFoundException('Lecturer not found');
        }
        return {
            id: lecturer.id,
            firstName: lecturer.firstName,
            lastName: lecturer.lastName,
            bio: lecturer.bio,
            qualifications: lecturer.qualifications,
            courses: lecturer.courses,
        };
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const updatedLecturer = await this.prisma.lecturer.update({
            where: { id: user.lecturer.id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                bio: dto.bio,
                qualifications: dto.qualifications,
            },
        });
        this.logger.log(`Lecturer profile updated: ${user.email}`);
        return {
            ...updatedLecturer,
            email: user.email,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async getAllLecturers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [lecturers, total] = await Promise.all([
            this.prisma.lecturer.findMany({
                where: {
                    user: {
                        isActive: true,
                    },
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            isActive: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            courses: true,
                            classes: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.lecturer.count({
                where: {
                    user: {
                        isActive: true,
                    },
                },
            }),
        ]);
        return {
            data: lecturers.map((lecturer) => ({
                id: lecturer.id,
                firstName: lecturer.firstName,
                lastName: lecturer.lastName,
                email: lecturer.user.email,
                bio: lecturer.bio,
                qualifications: lecturer.qualifications,
                coursesCount: lecturer._count.courses,
                classesCount: lecturer._count.classes,
                joinedDate: lecturer.user.createdAt,
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
exports.LecturerService = LecturerService;
exports.LecturerService = LecturerService = LecturerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LecturerService);
//# sourceMappingURL=lecturer.service.js.map