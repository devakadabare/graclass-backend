import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateLecturerProfileDto } from './dto/update-lecturer-profile.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import * as bcrypt from 'bcrypt';
import { UserRole, EnrollmentStatus } from '@prisma/client';

@Injectable()
export class LecturerService {
  private readonly logger = new Logger(LecturerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get lecturer profile by user ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        lecturer: true,
      },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
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

  /**
   * Get lecturer profile by lecturer ID (public view)
   */
  async getPublicProfile(lecturerId: string) {
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
      throw new NotFoundException('Lecturer not found');
    }

    if (!lecturer.user.isActive) {
      throw new NotFoundException('Lecturer not found');
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

  /**
   * Update lecturer profile
   */
  async updateProfile(userId: string, dto: UpdateLecturerProfileDto) {
    // Check if lecturer exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    // Update lecturer profile
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

  /**
   * Get all active lecturers (for admin/public listing)
   */
  async getAllLecturers(page: number = 1, limit: number = 10) {
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

  /**
   * Create a new student account (lecturer only)
   */
  async createStudent(lecturerId: string, dto: CreateStudentDto) {
    // Check if lecturer exists
    const lecturer = await this.prisma.user.findUnique({
      where: { id: lecturerId },
      include: { lecturer: true },
    });

    if (!lecturer || !lecturer.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user and student profile
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: UserRole.STUDENT,
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

    this.logger.log(
      `Student created by lecturer ${lecturer.email}: ${user.email}`,
    );

    return {
      id: user.student!.id,
      email: user.email,
      firstName: user.student!.firstName,
      lastName: user.student!.lastName,
      phone: user.student!.phone,
      university: user.student!.university,
      studentId: user.student!.studentId,
    };
  }

  /**
   * Directly enroll a student in a course (lecturer only)
   */
  async createEnrollment(lecturerId: string, dto: CreateEnrollmentDto) {
    // Validate that either studentId or studentGroupId is provided
    if (!dto.studentId && !dto.studentGroupId) {
      throw new BadRequestException(
        'Either studentId or studentGroupId must be provided',
      );
    }

    if (dto.studentId && dto.studentGroupId) {
      throw new BadRequestException(
        'Cannot provide both studentId and studentGroupId',
      );
    }

    // Get lecturer profile
    const lecturer = await this.prisma.user.findUnique({
      where: { id: lecturerId },
      include: { lecturer: true },
    });

    if (!lecturer || !lecturer.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    // Check if course exists and belongs to the lecturer
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      include: { lecturer: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.lecturerId !== lecturer.lecturer.id) {
      throw new ForbiddenException(
        'You can only enroll students in your own courses',
      );
    }

    // Check if student/group exists
    if (dto.studentId) {
      const student = await this.prisma.student.findUnique({
        where: { id: dto.studentId },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Check if enrollment already exists
      const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
        where: {
          courseId: dto.courseId,
          studentId: dto.studentId,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          'Student is already enrolled in this course',
        );
      }
    } else if (dto.studentGroupId) {
      const group = await this.prisma.studentGroup.findUnique({
        where: { id: dto.studentGroupId },
      });

      if (!group) {
        throw new NotFoundException('Student group not found');
      }

      // Check if enrollment already exists
      const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
        where: {
          courseId: dto.courseId,
          studentGroupId: dto.studentGroupId,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException('Group is already enrolled in this course');
      }
    }

    // Create enrollment with APPROVED status (direct enrollment by lecturer)
    const enrollment = await this.prisma.courseEnrollment.create({
      data: {
        courseId: dto.courseId,
        studentId: dto.studentId,
        studentGroupId: dto.studentGroupId,
        status: EnrollmentStatus.APPROVED,
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

    this.logger.log(
      `Enrollment created by lecturer ${lecturer.email}: Course ${course.name}, ${dto.studentId ? `Student ${enrollment.student?.firstName} ${enrollment.student?.lastName}` : `Group ${enrollment.studentGroup?.name}`}`,
    );

    return enrollment;
  }
}
