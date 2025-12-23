import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new availability slot
   */
  async createAvailability(userId: string, dto: CreateAvailabilityDto) {
    // Get lecturer profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    // Validate based on isRecurring
    if (dto.isRecurring && dto.dayOfWeek === undefined) {
      throw new BadRequestException(
        'dayOfWeek is required for recurring availability',
      );
    }

    if (!dto.isRecurring && !dto.specificDate) {
      throw new BadRequestException(
        'specificDate is required for one-time availability',
      );
    }

    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const availability = await this.prisma.availability.create({
      data: {
        lecturerId: user.lecturer.id,
        isRecurring: dto.isRecurring,
        dayOfWeek: dto.isRecurring ? dto.dayOfWeek : null,
        specificDate: dto.specificDate ? new Date(dto.specificDate) : null,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });

    this.logger.log(
      `Availability created for ${user.email}: ${dto.isRecurring ? `Every ${this.getDayName(dto.dayOfWeek!)}` : dto.specificDate} ${dto.startTime}-${dto.endTime}`,
    );

    return availability;
  }

  /**
   * Get all availability slots for a lecturer
   */
  async getLecturerAvailability(
    userId: string,
    includeExpired: boolean = false,
  ) {
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

    // Filter out expired one-time availabilities
    if (!includeExpired) {
      where.OR = [
        { isRecurring: true },
        {
          AND: [{ isRecurring: false }, { specificDate: { gte: new Date() } }],
        },
      ];
    }

    const availabilities = await this.prisma.availability.findMany({
      where,
      orderBy: [
        { isRecurring: 'desc' },
        { dayOfWeek: 'asc' },
        { specificDate: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return availabilities.map((a) => ({
      ...a,
      dayName: a.dayOfWeek !== null ? this.getDayName(a.dayOfWeek) : null,
    }));
  }

  /**
   * Get public availability for a lecturer (by lecturer ID)
   */
  async getPublicAvailability(lecturerId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id: lecturerId },
      include: { user: true },
    });

    if (!lecturer || !lecturer.user.isActive) {
      throw new NotFoundException('Lecturer not found');
    }

    const where: any = {
      lecturerId,
      OR: [
        { isRecurring: true },
        {
          AND: [{ isRecurring: false }, { specificDate: { gte: new Date() } }],
        },
      ],
    };

    const availabilities = await this.prisma.availability.findMany({
      where,
      orderBy: [
        { isRecurring: 'desc' },
        { dayOfWeek: 'asc' },
        { specificDate: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return availabilities.map((a) => ({
      id: a.id,
      isRecurring: a.isRecurring,
      dayOfWeek: a.dayOfWeek,
      dayName: a.dayOfWeek !== null ? this.getDayName(a.dayOfWeek) : null,
      specificDate: a.specificDate,
      startTime: a.startTime,
      endTime: a.endTime,
    }));
  }

  /**
   * Update availability slot
   */
  async updateAvailability(
    availabilityId: string,
    userId: string,
    dto: UpdateAvailabilityDto,
  ) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        lecturer: {
          include: { user: true },
        },
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this availability',
      );
    }

    // Validate time range if both times are being updated
    const newStartTime = dto.startTime || availability.startTime;
    const newEndTime = dto.endTime || availability.endTime;

    if (newStartTime >= newEndTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const updated = await this.prisma.availability.update({
      where: { id: availabilityId },
      data: dto,
    });

    this.logger.log(
      `Availability updated by ${availability.lecturer.user.email}`,
    );

    return updated;
  }

  /**
   * Delete availability slot
   */
  async deleteAvailability(availabilityId: string, userId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        lecturer: {
          include: { user: true },
        },
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.lecturer.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this availability',
      );
    }

    await this.prisma.availability.delete({
      where: { id: availabilityId },
    });

    this.logger.log(
      `Availability deleted by ${availability.lecturer.user.email}`,
    );

    return { message: 'Availability successfully deleted' };
  }

  /**
   * Helper method to get day name from day number
   */
  private getDayName(dayOfWeek: number): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayOfWeek] || 'Unknown';
  }
}
