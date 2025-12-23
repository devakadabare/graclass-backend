import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new student group
   */
  async createGroup(userId: string, dto: CreateGroupDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const group = await this.prisma.studentGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdBy: user.student.id,
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Automatically add creator as member
    await this.prisma.groupEnrollment.create({
      data: {
        studentId: user.student.id,
        groupId: group.id,
        status: EnrollmentStatus.APPROVED,
      },
    });

    this.logger.log(`Student group created: ${group.name} by ${user.email}`);

    return group;
  }

  /**
   * Get all groups (for students to browse)
   */
  async getAllGroups(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      this.prisma.studentGroup.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
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
      this.prisma.studentGroup.count({ where: { isActive: true } }),
    ]);

    return {
      data: groups.map((g) => ({
        ...g,
        memberCount: g._count.enrollments,
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
   * Get group by ID
   */
  async getGroupById(groupId: string) {
    const group = await this.prisma.studentGroup.findUnique({
      where: { id: groupId },
      include: {
        creator: {
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
        enrollments: {
          where: { status: EnrollmentStatus.APPROVED },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  /**
   * Get groups created by current student
   */
  async getMyGroups(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const groups = await this.prisma.studentGroup.findMany({
      where: { createdBy: user.student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return groups.map((g) => ({
      ...g,
      memberCount: g._count.enrollments,
    }));
  }

  /**
   * Get groups student is a member of
   */
  async getJoinedGroups(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const enrollments = await this.prisma.groupEnrollment.findMany({
      where: {
        studentId: user.student.id,
        status: EnrollmentStatus.APPROVED,
      },
      include: {
        group: {
          include: {
            creator: {
              select: {
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
        },
      },
    });

    return enrollments.map((e) => ({
      ...e.group,
      memberCount: e.group._count.enrollments,
    }));
  }

  /**
   * Join a group
   */
  async joinGroup(userId: string, groupId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const group = await this.prisma.studentGroup.findUnique({
      where: { id: groupId },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group not found or not active');
    }

    // Check if already a member
    const existing = await this.prisma.groupEnrollment.findUnique({
      where: {
        studentId_groupId: {
          studentId: user.student.id,
          groupId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already a member or pending approval');
    }

    const enrollment = await this.prisma.groupEnrollment.create({
      data: {
        studentId: user.student.id,
        groupId,
        status: EnrollmentStatus.PENDING,
      },
    });

    this.logger.log(
      `Student ${user.email} requested to join group: ${group.name}`,
    );

    return enrollment;
  }

  /**
   * Update group
   */
  async updateGroup(userId: string, groupId: string, dto: UpdateGroupDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const group = await this.prisma.studentGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.createdBy !== user.student.id) {
      throw new ForbiddenException('Only group creator can update the group');
    }

    const updated = await this.prisma.studentGroup.update({
      where: { id: groupId },
      data: dto,
    });

    this.logger.log(`Group updated: ${group.name} by ${user.email}`);

    return updated;
  }

  /**
   * Delete group
   */
  async deleteGroup(userId: string, groupId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const group = await this.prisma.studentGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.createdBy !== user.student.id) {
      throw new ForbiddenException('Only group creator can delete the group');
    }

    await this.prisma.studentGroup.delete({
      where: { id: groupId },
    });

    this.logger.log(`Group deleted: ${group.name} by ${user.email}`);

    return { message: 'Group successfully deleted' };
  }
}
