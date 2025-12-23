import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateLecturerProfileDto } from './dto/update-lecturer-profile.dto';

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
}
