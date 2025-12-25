import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { S3Service } from '../../common/services/s3.service';
import {
  generateCourseImageKey,
  validateFileSize,
} from '../../common/utils/file-upload.util';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Create a new course
   */
  async createCourse(
    userId: string,
    dto: CreateCourseDto,
    flyer?: Express.Multer.File,
    images?: Express.Multer.File[],
  ) {
    // Get lecturer profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    // Create course first to get the ID
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
      // Upload flyer if provided
      let flyerUrl: string | undefined;
      if (flyer) {
        validateFileSize(flyer, 5);
        const flyerKey = generateCourseImageKey(
          course.id,
          flyer.originalname,
          'flyer',
        );
        flyerUrl = await this.s3Service.uploadFile(
          flyer.buffer,
          flyerKey,
          flyer.mimetype,
        );
      }

      // Upload additional images if provided
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        for (const image of images) {
          validateFileSize(image, 5);
          const imageKey = generateCourseImageKey(
            course.id,
            image.originalname,
            'image',
          );
          const imageUrl = await this.s3Service.uploadFile(
            image.buffer,
            imageKey,
            image.mimetype,
          );
          imageUrls.push(imageUrl);
        }
      }

      // Update course with flyer URL and create image records
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
    } catch (error) {
      // If file upload fails, delete the course
      await this.prisma.course.delete({ where: { id: course.id } });
      this.logger.error(`Failed to create course: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all courses for a lecturer
   */
  async getLecturerCourses(userId: string, includeInactive = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    const where: any = {
      lecturerId: user.lecturer.id,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy: [
        {
          isActive: 'desc', // Active courses first
        },
        {
          createdAt: 'desc', // Then by creation date
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

  /**
   * Get a single course by ID
   */
  async getCourseById(courseId: string, userId?: string) {
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
      throw new NotFoundException('Course not found');
    }

    // Generate presigned URLs for flyer and images
    let flyerUrl = course.flyer;
    if (course.flyer) {
      try {
        const key = this.s3Service.extractKeyFromUrl(course.flyer);
        flyerUrl = await this.s3Service.getSignedUrl(key, 3600); // 1 hour expiry
      } catch (error) {
        this.logger.warn(`Failed to generate signed URL for flyer: ${error.message}`);
      }
    }

    const imagesWithSignedUrls = await Promise.all(
      course.images.map(async (image) => {
        try {
          const key = this.s3Service.extractKeyFromUrl(image.imageUrl);
          const signedUrl = await this.s3Service.getSignedUrl(key, 3600);
          return {
            ...image,
            imageUrl: signedUrl,
          };
        } catch (error) {
          this.logger.warn(`Failed to generate signed URL for image: ${error.message}`);
          return image;
        }
      })
    );

    // If a userId is provided, verify ownership for private data
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

    // Return public data
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

  /**
   * Update a course
   */
  async updateCourse(
    courseId: string,
    userId: string,
    dto: UpdateCourseDto,
    flyer?: Express.Multer.File,
    images?: Express.Multer.File[],
  ) {
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
      throw new NotFoundException('Course not found');
    }

    if (course.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this course',
      );
    }

    const updateData: any = { ...dto };

    // Handle flyer upload
    if (flyer) {
      validateFileSize(flyer, 5);

      // Delete old flyer if exists
      if (course.flyer) {
        const oldFlyerKey = this.s3Service.extractKeyFromUrl(course.flyer);
        if (oldFlyerKey) {
          await this.s3Service.deleteFile(oldFlyerKey);
        }
      }

      // Upload new flyer
      const flyerKey = generateCourseImageKey(
        course.id,
        flyer.originalname,
        'flyer',
      );
      updateData.flyer = await this.s3Service.uploadFile(
        flyer.buffer,
        flyerKey,
        flyer.mimetype,
      );
    }

    // Handle additional images upload
    if (images && images.length > 0) {
      // Delete old images
      for (const oldImage of course.images) {
        const oldImageKey = this.s3Service.extractKeyFromUrl(oldImage.imageUrl);
        if (oldImageKey) {
          await this.s3Service.deleteFile(oldImageKey);
        }
      }

      // Delete old image records
      await this.prisma.courseImage.deleteMany({
        where: { courseId: course.id },
      });

      // Upload new images
      const imageRecords: { imageUrl: string; order: number }[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        validateFileSize(image, 5);
        const imageKey = generateCourseImageKey(
          course.id,
          image.originalname,
          'image',
        );
        const imageUrl = await this.s3Service.uploadFile(
          image.buffer,
          imageKey,
          image.mimetype,
        );
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

    this.logger.log(
      `Course updated: ${updatedCourse.name} by ${course.lecturer.user.email}`,
    );

    return updatedCourse;
  }

  /**
   * Delete a course (soft delete by setting isActive to false)
   */
  async deleteCourse(courseId: string, userId: string) {
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
      throw new NotFoundException('Course not found');
    }

    if (course.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this course',
      );
    }

    await this.prisma.course.update({
      where: { id: courseId },
      data: { isActive: false },
    });

    this.logger.log(
      `Course deactivated: ${course.name} by ${course.lecturer.user.email}`,
    );

    return { message: 'Course successfully deactivated' };
  }

  /**
   * Search courses (public)
   */
  async searchCourses(params: {
    subject?: string;
    level?: string;
    page?: number;
    limit?: number;
  }) {
    const { subject, level, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
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
}
