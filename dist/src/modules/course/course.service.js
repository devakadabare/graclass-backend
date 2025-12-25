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
const s3_service_1 = require("../../common/services/s3.service");
const file_upload_util_1 = require("../../common/utils/file-upload.util");
let CourseService = CourseService_1 = class CourseService {
    prisma;
    s3Service;
    logger = new common_1.Logger(CourseService_1.name);
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
    }
    async createCourse(userId, dto, flyer, images) {
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
        try {
            let flyerUrl;
            if (flyer) {
                (0, file_upload_util_1.validateFileSize)(flyer, 5);
                const flyerKey = (0, file_upload_util_1.generateCourseImageKey)(course.id, flyer.originalname, 'flyer');
                flyerUrl = await this.s3Service.uploadFile(flyer.buffer, flyerKey, flyer.mimetype);
            }
            const imageUrls = [];
            if (images && images.length > 0) {
                for (const image of images) {
                    (0, file_upload_util_1.validateFileSize)(image, 5);
                    const imageKey = (0, file_upload_util_1.generateCourseImageKey)(course.id, image.originalname, 'image');
                    const imageUrl = await this.s3Service.uploadFile(image.buffer, imageKey, image.mimetype);
                    imageUrls.push(imageUrl);
                }
            }
            const updatedCourse = await this.prisma.course.update({
                where: { id: course.id },
                data: {
                    flyer: flyerUrl,
                    images: {
                        create: imageUrls.map((url, index) => ({
                            imageUrl: url,
                            order: index,
                        })),
                    },
                },
                include: {
                    images: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            });
            this.logger.log(`Course created: ${course.name} by ${user.email}`);
            return updatedCourse;
        }
        catch (error) {
            await this.prisma.course.delete({ where: { id: course.id } });
            this.logger.error(`Failed to create course: ${error.message}`);
            throw error;
        }
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
            orderBy: [
                {
                    isActive: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
            include: {
                images: {
                    orderBy: {
                        order: 'asc',
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
                images: {
                    orderBy: {
                        order: 'asc',
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
        let flyerUrl = course.flyer;
        if (course.flyer) {
            try {
                const key = this.s3Service.extractKeyFromUrl(course.flyer);
                flyerUrl = await this.s3Service.getSignedUrl(key, 3600);
            }
            catch (error) {
                this.logger.warn(`Failed to generate signed URL for flyer: ${error.message}`);
            }
        }
        const imagesWithSignedUrls = await Promise.all(course.images.map(async (image) => {
            try {
                const key = this.s3Service.extractKeyFromUrl(image.imageUrl);
                const signedUrl = await this.s3Service.getSignedUrl(key, 3600);
                return {
                    ...image,
                    imageUrl: signedUrl,
                };
            }
            catch (error) {
                this.logger.warn(`Failed to generate signed URL for image: ${error.message}`);
                return image;
            }
        }));
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { lecturer: true },
            });
            if (user?.lecturer?.id === course.lecturerId) {
                return {
                    ...course,
                    flyer: flyerUrl,
                    images: imagesWithSignedUrls,
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
            flyer: flyerUrl,
            isActive: course.isActive,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            images: imagesWithSignedUrls,
            lecturer: {
                id: course.lecturer.id,
                firstName: course.lecturer.firstName,
                lastName: course.lecturer.lastName,
                email: course.lecturer.user.email,
            },
            enrollmentsCount: course._count.enrollments,
            classesCount: course._count.classes,
            isOwner: false,
        };
    }
    async updateCourse(courseId, userId, dto, flyer, images) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lecturer: {
                    include: {
                        user: true,
                    },
                },
                images: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this course');
        }
        const updateData = { ...dto };
        if (flyer) {
            (0, file_upload_util_1.validateFileSize)(flyer, 5);
            if (course.flyer) {
                const oldFlyerKey = this.s3Service.extractKeyFromUrl(course.flyer);
                if (oldFlyerKey) {
                    await this.s3Service.deleteFile(oldFlyerKey);
                }
            }
            const flyerKey = (0, file_upload_util_1.generateCourseImageKey)(course.id, flyer.originalname, 'flyer');
            updateData.flyer = await this.s3Service.uploadFile(flyer.buffer, flyerKey, flyer.mimetype);
        }
        if (images && images.length > 0) {
            for (const oldImage of course.images) {
                const oldImageKey = this.s3Service.extractKeyFromUrl(oldImage.imageUrl);
                if (oldImageKey) {
                    await this.s3Service.deleteFile(oldImageKey);
                }
            }
            await this.prisma.courseImage.deleteMany({
                where: { courseId: course.id },
            });
            const imageRecords = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                (0, file_upload_util_1.validateFileSize)(image, 5);
                const imageKey = (0, file_upload_util_1.generateCourseImageKey)(course.id, image.originalname, 'image');
                const imageUrl = await this.s3Service.uploadFile(image.buffer, imageKey, image.mimetype);
                imageRecords.push({
                    imageUrl,
                    order: i,
                });
            }
            updateData.images = {
                create: imageRecords,
            };
        }
        const updatedCourse = await this.prisma.course.update({
            where: { id: courseId },
            data: updateData,
            include: {
                images: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
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
                    images: {
                        orderBy: {
                            order: 'asc',
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
                flyer: course.flyer,
                images: course.images,
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], CourseService);
//# sourceMappingURL=course.service.js.map