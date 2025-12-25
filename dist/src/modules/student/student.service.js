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
var StudentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const s3_service_1 = require("../../common/services/s3.service");
const client_1 = require("@prisma/client");
const file_upload_util_1 = require("../../common/utils/file-upload.util");
let StudentService = StudentService_1 = class StudentService {
    prisma;
    s3Service;
    logger = new common_1.Logger(StudentService_1.name);
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
            },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        let profileImageUrl = user.student.profileImage;
        if (profileImageUrl) {
            const key = this.s3Service.extractKeyFromUrl(profileImageUrl);
            if (key) {
                profileImageUrl = await this.s3Service.getSignedUrl(key, 86400);
            }
        }
        return {
            ...user.student,
            profileImage: profileImageUrl,
            email: user.email,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async updateProfile(userId, dto, file) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        let profileImageUrl = dto.profileImage;
        if (file) {
            (0, file_upload_util_1.validateFileSize)(file, 5);
            if (user.student.profileImage) {
                const oldKey = this.s3Service.extractKeyFromUrl(user.student.profileImage);
                if (oldKey) {
                    await this.s3Service.deleteFile(oldKey).catch((err) => {
                        this.logger.warn(`Failed to delete old profile image: ${err.message}`);
                    });
                }
            }
            const key = (0, file_upload_util_1.generateProfileImageKey)('students', user.student.id, file.originalname);
            profileImageUrl = await this.s3Service.uploadFile(file.buffer, key, file.mimetype);
        }
        const updatedStudent = await this.prisma.student.update({
            where: { id: user.student.id },
            data: {
                ...dto,
                profileImage: profileImageUrl,
            },
        });
        this.logger.log(`Student profile updated: ${user.email}`);
        let signedProfileImageUrl = profileImageUrl;
        if (profileImageUrl) {
            const key = this.s3Service.extractKeyFromUrl(profileImageUrl);
            if (key) {
                signedProfileImageUrl = await this.s3Service.getSignedUrl(key, 86400);
            }
        }
        return {
            ...updatedStudent,
            profileImage: signedProfileImageUrl,
            email: user.email,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async enrollInCourse(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: dto.courseId },
        });
        if (!course || !course.isActive) {
            throw new common_1.NotFoundException('Course not found or not available');
        }
        const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
            where: {
                courseId: dto.courseId,
                studentId: user.student.id,
            },
        });
        if (existingEnrollment) {
            throw new common_1.BadRequestException('You are already enrolled or have a pending enrollment for this course');
        }
        const enrollment = await this.prisma.courseEnrollment.create({
            data: {
                courseId: dto.courseId,
                studentId: user.student.id,
                studentGroupId: dto.studentGroupId || null,
                status: client_1.EnrollmentStatus.PENDING,
            },
            include: {
                course: {
                    select: {
                        name: true,
                        subject: true,
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
        this.logger.log(`Student ${user.email} requested enrollment in course: ${course.name}`);
        return enrollment;
    }
    async getMyEnrollments(userId, status) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const where = {
            studentId: user.student.id,
        };
        if (status) {
            where.status = status;
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
                        level: true,
                        duration: true,
                        hourlyRate: true,
                        lecturer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        return enrollments;
    }
    async getEnrolledCourses(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const enrollments = await this.prisma.courseEnrollment.findMany({
            where: {
                studentId: user.student.id,
                status: client_1.EnrollmentStatus.APPROVED,
            },
            include: {
                course: {
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
                                classes: true,
                            },
                        },
                    },
                },
            },
        });
        return enrollments.map((e) => ({
            enrollmentId: e.id,
            enrolledAt: e.approvedAt,
            course: {
                ...e.course,
                totalClasses: e.course._count.classes,
            },
        }));
    }
    async getMyClasses(userId, upcoming = true) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: {
                    include: {
                        groupEnrollments: {
                            select: {
                                groupId: true,
                            },
                        },
                        courseEnrollments: {
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
        if (!user || !user.student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const studentGroupIds = user.student.groupEnrollments.map((enrollment) => enrollment.groupId);
        const enrolledCourseIds = user.student.courseEnrollments.map((enrollment) => enrollment.courseId);
        const where = {
            OR: [
                { studentId: user.student.id },
                ...(studentGroupIds.length > 0
                    ? [{ studentGroupId: { in: studentGroupIds } }]
                    : []),
                ...(enrolledCourseIds.length > 0
                    ? [
                        {
                            courseId: { in: enrolledCourseIds },
                            studentId: null,
                            studentGroupId: null,
                        },
                    ]
                    : []),
            ],
        };
        if (upcoming) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            where.date = {
                gte: today,
            };
            where.status = 'SCHEDULED';
        }
        const classes = await this.prisma.class.findMany({
            where,
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
            include: {
                course: {
                    select: {
                        name: true,
                        subject: true,
                        lecturer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                lecturer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return classes;
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = StudentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], StudentService);
//# sourceMappingURL=student.service.js.map