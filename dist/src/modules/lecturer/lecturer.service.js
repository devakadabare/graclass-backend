"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LecturerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LecturerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const s3_service_1 = require("../../common/services/s3.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const file_upload_util_1 = require("../../common/utils/file-upload.util");
let LecturerService = LecturerService_1 = class LecturerService {
    prisma;
    s3Service;
    logger = new common_1.Logger(LecturerService_1.name);
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
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
        let profileImageUrl = user.lecturer.profileImage;
        if (profileImageUrl) {
            const key = this.s3Service.extractKeyFromUrl(profileImageUrl);
            if (key) {
                profileImageUrl = await this.s3Service.getSignedUrl(key, 86400);
            }
        }
        return {
            ...user.lecturer,
            profileImage: profileImageUrl,
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
    async updateProfile(userId, dto, file) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        let profileImageUrl = dto.profileImage;
        if (file) {
            (0, file_upload_util_1.validateFileSize)(file, 5);
            if (user.lecturer.profileImage) {
                const oldKey = this.s3Service.extractKeyFromUrl(user.lecturer.profileImage);
                if (oldKey) {
                    await this.s3Service.deleteFile(oldKey).catch((err) => {
                        this.logger.warn(`Failed to delete old profile image: ${err.message}`);
                    });
                }
            }
            const key = (0, file_upload_util_1.generateProfileImageKey)('lecturers', user.lecturer.id, file.originalname);
            profileImageUrl = await this.s3Service.uploadFile(file.buffer, key, file.mimetype);
        }
        const updatedLecturer = await this.prisma.lecturer.update({
            where: { id: user.lecturer.id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                bio: dto.bio,
                qualifications: dto.qualifications,
                profileImage: profileImageUrl,
            },
        });
        this.logger.log(`Lecturer profile updated: ${user.email}`);
        let signedProfileImageUrl = profileImageUrl;
        if (profileImageUrl) {
            const key = this.s3Service.extractKeyFromUrl(profileImageUrl);
            if (key) {
                signedProfileImageUrl = await this.s3Service.getSignedUrl(key, 86400);
            }
        }
        const response = {
            ...updatedLecturer,
            profileImage: signedProfileImageUrl,
            email: user.email,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        console.log('=== LECTURER SERVICE RESPONSE ===');
        console.log('Profile Image URL:', response.profileImage);
        console.log('Full Response:', JSON.stringify(response, null, 2));
        console.log('=================================');
        return response;
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
    async createStudent(lecturerId, dto) {
        const lecturer = await this.prisma.user.findUnique({
            where: { id: lecturerId },
            include: { lecturer: true },
        });
        if (!lecturer || !lecturer.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: client_1.UserRole.STUDENT,
                student: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        phone: dto.phone,
                        university: dto.university,
                        studentId: dto.studentId,
                    },
                },
            },
            include: {
                student: true,
            },
        });
        this.logger.log(`Student created by lecturer ${lecturer.email}: ${user.email}`);
        return {
            id: user.student.id,
            email: user.email,
            firstName: user.student.firstName,
            lastName: user.student.lastName,
            phone: user.student.phone,
            university: user.student.university,
            studentId: user.student.studentId,
        };
    }
    async createEnrollment(lecturerId, dto) {
        if (!dto.studentId && !dto.studentGroupId) {
            throw new common_1.BadRequestException('Either studentId or studentGroupId must be provided');
        }
        if (dto.studentId && dto.studentGroupId) {
            throw new common_1.BadRequestException('Cannot provide both studentId and studentGroupId');
        }
        const lecturer = await this.prisma.user.findUnique({
            where: { id: lecturerId },
            include: { lecturer: true },
        });
        if (!lecturer || !lecturer.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: dto.courseId },
            include: { lecturer: true },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.lecturerId !== lecturer.lecturer.id) {
            throw new common_1.ForbiddenException('You can only enroll students in your own courses');
        }
        if (dto.studentId) {
            const student = await this.prisma.student.findUnique({
                where: { id: dto.studentId },
            });
            if (!student) {
                throw new common_1.NotFoundException('Student not found');
            }
            const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
                where: {
                    courseId: dto.courseId,
                    studentId: dto.studentId,
                },
            });
            if (existingEnrollment) {
                throw new common_1.ConflictException('Student is already enrolled in this course');
            }
        }
        else if (dto.studentGroupId) {
            const group = await this.prisma.studentGroup.findUnique({
                where: { id: dto.studentGroupId },
            });
            if (!group) {
                throw new common_1.NotFoundException('Student group not found');
            }
            const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
                where: {
                    courseId: dto.courseId,
                    studentGroupId: dto.studentGroupId,
                },
            });
            if (existingEnrollment) {
                throw new common_1.ConflictException('Group is already enrolled in this course');
            }
        }
        const enrollment = await this.prisma.courseEnrollment.create({
            data: {
                courseId: dto.courseId,
                studentId: dto.studentId,
                studentGroupId: dto.studentGroupId,
                status: client_1.EnrollmentStatus.APPROVED,
            },
            include: {
                course: {
                    select: {
                        name: true,
                        subject: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                studentGroup: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        this.logger.log(`Enrollment created by lecturer ${lecturer.email}: Course ${course.name}, ${dto.studentId ? `Student ${enrollment.student?.firstName} ${enrollment.student?.lastName}` : `Group ${enrollment.studentGroup?.name}`}`);
        return enrollment;
    }
};
exports.LecturerService = LecturerService;
exports.LecturerService = LecturerService = LecturerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], LecturerService);
//# sourceMappingURL=lecturer.service.js.map