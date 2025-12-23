import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new course
   */
  async createCourse(userId: string, dto: CreateCourseDto) {
    // Get lecturer profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
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

    // If a userId is provided, verify ownership for private data
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

    // Return public data
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

  /**
   * Update a course
   */
  async updateCourse(courseId: string, userId: string, dto: UpdateCourseDto) {
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
        'You do not have permission to update this course',
      );
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: dto,
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
}
