import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new class
   */
  async createClass(userId: string, dto: CreateClassDto) {
    // Get lecturer profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    // Validate course belongs to lecturer
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.lecturerId !== user.lecturer.id) {
      throw new ForbiddenException(
        'You can only create classes for your own courses',
      );
    }

    // Validate student or group is provided
    if (!dto.studentId && !dto.studentGroupId) {
      throw new BadRequestException(
        'Either studentId or studentGroupId must be provided',
      );
    }

    if (dto.studentId && dto.studentGroupId) {
      throw new BadRequestException(
        'Cannot specify both studentId and studentGroupId',
      );
    }

    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const classData = await this.prisma.class.create({
      data: {
        courseId: dto.courseId,
        lecturerId: user.lecturer.id,
        studentId: dto.studentId || null,
        studentGroupId: dto.studentGroupId || null,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        meetingLink: dto.meetingLink,
        location: dto.location,
      },
    });

    this.logger.log(
      `Class created: ${course.name} on ${dto.date} by ${user.email}`,
    );

    return classData;
  }

  /**
   * Get all classes for a lecturer
   */
  async getLecturerClasses(userId: string, status?: string, fromDate?: string) {
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

    if (status) {
      where.status = status;
    }

    if (fromDate) {
      where.date = {
        gte: new Date(fromDate),
      };
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

    return classes;
  }

  /**
   * Get a single class by ID
   */
  async getClassById(classId: string, userId?: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: {
          select: {
            name: true,
            subject: true,
            level: true,
            duration: true,
          },
        },
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
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

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Check if user has access to this class
    if (userId) {
      const hasAccess =
        classData.lecturer.userId === userId ||
        classData.student?.userId === userId;

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have permission to view this class',
        );
      }
    }

    return classData;
  }

  /**
   * Update a class
   */
  async updateClass(classId: string, userId: string, dto: UpdateClassDto) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        lecturer: {
          include: { user: true },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    if (classData.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this class',
      );
    }

    // Validate time range if being updated
    if (dto.startTime || dto.endTime) {
      const newStartTime = dto.startTime || classData.startTime;
      const newEndTime = dto.endTime || classData.endTime;

      if (newStartTime >= newEndTime) {
        throw new BadRequestException('startTime must be before endTime');
      }
    }

    const updateData: any = {};
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.startTime) updateData.startTime = dto.startTime;
    if (dto.endTime) updateData.endTime = dto.endTime;
    if (dto.meetingLink !== undefined) updateData.meetingLink = dto.meetingLink;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.status) updateData.status = dto.status;

    const updated = await this.prisma.class.update({
      where: { id: classId },
      data: updateData,
    });

    this.logger.log(
      `Class updated by ${classData.lecturer.user.email}: ${classId}`,
    );

    return updated;
  }

  /**
   * Cancel a class
   */
  async cancelClass(classId: string, userId: string) {
    return this.updateClass(classId, userId, { status: 'CANCELLED' });
  }

  /**
   * Delete a class
   */
  async deleteClass(classId: string, userId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        lecturer: {
          include: { user: true },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    if (classData.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this class',
      );
    }

    await this.prisma.class.delete({
      where: { id: classId },
    });

    this.logger.log(
      `Class deleted by ${classData.lecturer.user.email}: ${classId}`,
    );

    return { message: 'Class successfully deleted' };
  }
}
