import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all enrollments for lecturer's courses
   */
  async getLecturerEnrollments(
    userId: string,
    status?: EnrollmentStatus,
    courseId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    const where: any = {
      course: {
        lecturerId: user.lecturer.id,
      },
    };

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
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
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
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

    return enrollments.map((e) => ({
      id: e.id,
      status: e.status,
      requestedAt: e.requestedAt,
      approvedAt: e.approvedAt,
      course: e.course,
      student: e.student
        ? {
            id: e.student.id,
            firstName: e.student.firstName,
            lastName: e.student.lastName,
            email: e.student.user.email,
          }
        : null,
      studentGroup: e.studentGroup,
    }));
  }

  /**
   * Get pending enrollments count for lecturer
   */
  async getPendingEnrollmentsCount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    const count = await this.prisma.courseEnrollment.count({
      where: {
        course: {
          lecturerId: user.lecturer.id,
        },
        status: EnrollmentStatus.PENDING,
      },
    });

    return { count };
  }

  /**
   * Approve or reject an enrollment
   */
  async updateEnrollmentStatus(
    enrollmentId: string,
    userId: string,
    status: EnrollmentStatus,
  ) {
    // Find the enrollment
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            lecturer: {
              include: {
                user: true,
              },
            },
          },
        },
        student: {
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
        studentGroup: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Verify the lecturer owns the course
    if (enrollment.course.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to manage this enrollment',
      );
    }

    // Check if enrollment is already processed
    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException(
        `Enrollment has already been ${enrollment.status.toLowerCase()}`,
      );
    }

    // Update enrollment status
    const updated = await this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        approvedAt: status === EnrollmentStatus.APPROVED ? new Date() : null,
      },
      include: {
        course: {
          select: {
            name: true,
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

    const studentIdentifier = enrollment.student
      ? `${enrollment.student.firstName} ${enrollment.student.lastName} (${enrollment.student.user.email})`
      : `Group: ${enrollment.studentGroup?.name}`;

    this.logger.log(
      `Enrollment ${status.toLowerCase()}: ${studentIdentifier} for course "${enrollment.course.name}" by ${enrollment.course.lecturer.user.email}`,
    );

    return {
      id: updated.id,
      status: updated.status,
      requestedAt: updated.requestedAt,
      approvedAt: updated.approvedAt,
      course: updated.course,
      student: updated.student,
      studentGroup: updated.studentGroup,
    };
  }

  /**
   * Get enrollment details
   */
  async getEnrollmentById(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            lecturer: {
              include: {
                user: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            university: true,
            studentId: true,
            user: {
              select: {
                email: true,
              },
            },
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

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Verify the lecturer owns the course
    if (enrollment.course.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this enrollment',
      );
    }

    return {
      id: enrollment.id,
      status: enrollment.status,
      requestedAt: enrollment.requestedAt,
      approvedAt: enrollment.approvedAt,
      course: {
        id: enrollment.course.id,
        name: enrollment.course.name,
        subject: enrollment.course.subject,
        level: enrollment.course.level,
      },
      student: enrollment.student
        ? {
            ...enrollment.student,
            email: enrollment.student.user.email,
          }
        : null,
      studentGroup: enrollment.studentGroup,
    };
  }
}
