import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get student profile by user ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
      },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    return {
      ...user.student,
      email: user.email,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update student profile
   */
  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id: user.student.id },
      data: dto,
    });

    this.logger.log(`Student profile updated: ${user.email}`);

    return {
      ...updatedStudent,
      email: user.email,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(userId: string, dto: EnrollCourseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    // Check if course exists and is active
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course || !course.isActive) {
      throw new NotFoundException('Course not found or not available');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        courseId: dto.courseId,
        studentId: user.student.id,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'You are already enrolled or have a pending enrollment for this course',
      );
    }

    // Create enrollment request
    const enrollment = await this.prisma.courseEnrollment.create({
      data: {
        courseId: dto.courseId,
        studentId: user.student.id,
        studentGroupId: dto.studentGroupId || null,
        status: EnrollmentStatus.PENDING,
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

    this.logger.log(
      `Student ${user.email} requested enrollment in course: ${course.name}`,
    );

    return enrollment;
  }

  /**
   * Get student's enrollments
   */
  async getMyEnrollments(userId: string, status?: EnrollmentStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const where: any = {
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

  /**
   * Get enrolled courses
   */
  async getEnrolledCourses(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: {
        studentId: user.student.id,
        status: EnrollmentStatus.APPROVED,
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

  /**
   * Get student's scheduled classes
   */
  async getMyClasses(userId: string, upcoming: boolean = true) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const where: any = {
      studentId: user.student.id,
    };

    if (upcoming) {
      where.date = {
        gte: new Date(),
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
}
