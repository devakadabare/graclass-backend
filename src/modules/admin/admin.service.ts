import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    role?: UserRole,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lecturer: {
            select: {
              firstName: true,
              lastName: true,
              _count: {
                select: {
                  courses: true,
                  classes: true,
                },
              },
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
              university: true,
              _count: {
                select: {
                  courseEnrollments: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        profile: user.lecturer || user.student,
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
   * Get user by ID with full details
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        lecturer: {
          include: {
            _count: {
              select: {
                courses: true,
                classes: true,
                availabilities: true,
              },
            },
          },
        },
        student: {
          include: {
            _count: {
              select: {
                courseEnrollments: true,
                individualClasses: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    this.logger.log(
      `User ${user.email} ${isActive ? 'activated' : 'deactivated'}`,
    );

    return updated;
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const [
      totalUsers,
      totalLecturers,
      totalStudents,
      totalCourses,
      activeCourses,
      totalClasses,
      totalEnrollments,
      pendingEnrollments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.LECTURER } }),
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isActive: true } }),
      this.prisma.class.count(),
      this.prisma.courseEnrollment.count(),
      this.prisma.courseEnrollment.count({ where: { status: 'PENDING' } }),
    ]);

    // Get recent activity
    const recentUsers = await this.prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      overview: {
        totalUsers,
        totalLecturers,
        totalStudents,
        totalCourses,
        activeCourses,
        totalClasses,
        totalEnrollments,
        pendingEnrollments,
      },
      recentUsers,
    };
  }

  /**
   * Get all courses (admin view)
   */
  async getAllCourses(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lecturer: {
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
          _count: {
            select: {
              enrollments: true,
              classes: true,
            },
          },
        },
      }),
      this.prisma.course.count(),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all enrollments (admin view)
   */
  async getAllEnrollments(
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [enrollments, total] = await Promise.all([
      this.prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          course: {
            select: {
              name: true,
              subject: true,
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
        },
      }),
      this.prisma.courseEnrollment.count({ where }),
    ]);

    return {
      data: enrollments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
