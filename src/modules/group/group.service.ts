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
   * Generate a unique 6-character alphanumeric group code
   */
  private async generateGroupCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if code already exists
      const existing = await this.prisma.studentGroup.findUnique({
        where: { groupCode: code },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return code;
  }

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

    // Generate unique group code
    const groupCode = await this.generateGroupCode();

    const group = await this.prisma.studentGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        groupCode,
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

    // Automatically add creator as member with approved status
    await this.prisma.groupEnrollment.create({
      data: {
        studentId: user.student.id,
        groupId: group.id,
        status: EnrollmentStatus.APPROVED,
        approvedByOwner: true,
        approvedAt: new Date(),
      },
    });

    this.logger.log(
      `Student group created: ${group.name} by ${user.email} with code: ${groupCode}`,
    );

    return group;
  }

  /**
   * Search for a group by group code
   */
  async searchByGroupCode(groupCode: string) {
    const group = await this.prisma.studentGroup.findUnique({
      where: { groupCode },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group not found or not active');
    }

    return {
      ...group,
      memberCount: group._count.members,
    };
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
              members: true,
            },
          },
        },
      }),
      this.prisma.studentGroup.count({ where: { isActive: true } }),
    ]);

    return {
      data: groups.map((g) => ({
        ...g,
        memberCount: g._count.members,
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
        members: {
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
   * Get detailed group information for popup/modal display
   * Includes group code, creator info, and all members with their details
   */
  async getGroupDetails(groupId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const group = await this.prisma.studentGroup.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            university: true,
            studentId: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        members: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                university: true,
                studentId: true,
                profileImage: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        courseEnrolls: {
          where: {
            status: EnrollmentStatus.APPROVED,
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                subject: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            courseEnrolls: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is the creator
    const isCreator = group.createdBy === user.student!.id;

    // Check if user is a member
    const userMembership = group.members.find(
      (m) => m.studentId === user.student!.id,
    );
    const isMember = !!userMembership;

    // Separate members by status
    const approvedMembers = group.members.filter(
      (m) => m.status === EnrollmentStatus.APPROVED,
    );
    const pendingMembers = group.members.filter(
      (m) => m.status === EnrollmentStatus.PENDING,
    );

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      groupCode: group.groupCode,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      creator: group.creator,
      isCreator,
      isMember,
      membershipStatus: userMembership?.status || null,
      stats: {
        totalMembers: approvedMembers.length,
        pendingRequests: pendingMembers.length,
        enrolledCourses: group._count.courseEnrolls,
      },
      members: approvedMembers.map((m) => ({
        enrollmentId: m.id,
        joinedAt: m.approvedAt,
        student: {
          id: m.student.id,
          firstName: m.student.firstName,
          lastName: m.student.lastName,
          university: m.student.university,
          studentId: m.student.studentId,
          profileImage: m.student.profileImage,
          email: m.student.user.email,
        },
      })),
      pendingRequests: isCreator
        ? pendingMembers.map((m) => ({
            enrollmentId: m.id,
            requestedAt: m.createdAt,
            student: {
              id: m.student.id,
              firstName: m.student.firstName,
              lastName: m.student.lastName,
              university: m.student.university,
              studentId: m.student.studentId,
              profileImage: m.student.profileImage,
              email: m.student.user.email,
            },
          }))
        : [],
      enrolledCourses: group.courseEnrolls.map((ce) => ({
        id: ce.course.id,
        name: ce.course.name,
        subject: ce.course.subject,
        enrolledAt: ce.approvedAt,
      })),
    };
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
            members: true,
          },
        },
      },
    });

    return groups.map((g) => ({
      ...g,
      memberCount: g._count.members,
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
                members: true,
              },
            },
          },
        },
      },
    });

    return enrollments.map((e) => ({
      ...e.group,
      memberCount: e.group._count.members,
    }));
  }

  /**
   * Join a group using group code
   */
  async joinGroupByCode(userId: string, groupCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const group = await this.prisma.studentGroup.findUnique({
      where: { groupCode },
    });

    if (!group || !group.isActive) {
      throw new NotFoundException('Group not found or not active');
    }

    // Check if already a member
    const existing = await this.prisma.groupEnrollment.findUnique({
      where: {
        studentId_groupId: {
          studentId: user.student.id,
          groupId: group.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already a member or pending approval');
    }

    const enrollment = await this.prisma.groupEnrollment.create({
      data: {
        studentId: user.student.id,
        groupId: group.id,
        status: EnrollmentStatus.PENDING,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(
      `Student ${user.email} requested to join group: ${group.name}`,
    );

    return enrollment;
  }

  /**
   * Get pending join requests for groups owned by current student
   */
  async getPendingJoinRequests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const requests = await this.prisma.groupEnrollment.findMany({
      where: {
        group: {
          createdBy: user.student.id,
        },
        status: EnrollmentStatus.PENDING,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            university: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            groupCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return requests;
  }

  /**
   * Approve a student's join request (group owner only)
   */
  async approveJoinRequest(userId: string, enrollmentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const enrollment = await this.prisma.groupEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        group: {
          include: {
            courseEnrolls: {
              where: {
                status: EnrollmentStatus.APPROVED,
              },
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Join request not found');
    }

    if (enrollment.group.createdBy !== user.student.id) {
      throw new ForbiddenException('Only group owner can approve join requests');
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException('Request already processed');
    }

    // Approve the group enrollment
    const updated = await this.prisma.groupEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.APPROVED,
        approvedByOwner: true,
        approvedAt: new Date(),
      },
    });

    // If the group is enrolled in any courses, create pending course enrollments
    // for the new student (requires lecturer approval)
    if (enrollment.group.courseEnrolls.length > 0) {
      const courseEnrollments = enrollment.group.courseEnrolls.map((ce) => ({
        studentId: enrollment.studentId,
        courseId: ce.courseId,
        groupEnrollmentId: enrollmentId,
        studentGroupId: enrollment.groupId,
        status: EnrollmentStatus.PENDING,
        approvedByLecturer: false,
      }));

      await this.prisma.studentCourseEnrollment.createMany({
        data: courseEnrollments,
      });

      this.logger.log(
        `Created ${courseEnrollments.length} pending course enrollments for student joining group`,
      );
    }

    this.logger.log(
      `Group join request approved: ${enrollment.group.name} by ${user.email}`,
    );

    return updated;
  }

  /**
   * Reject a student's join request (group owner only)
   */
  async rejectJoinRequest(userId: string, enrollmentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const enrollment = await this.prisma.groupEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        group: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Join request not found');
    }

    if (enrollment.group.createdBy !== user.student.id) {
      throw new ForbiddenException('Only group owner can reject join requests');
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException('Request already processed');
    }

    const updated = await this.prisma.groupEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.REJECTED,
        rejectedAt: new Date(),
      },
    });

    this.logger.log(
      `Group join request rejected: ${enrollment.group.name} by ${user.email}`,
    );

    return updated;
  }

  /**
   * Remove a member from group (group owner only)
   */
  async removeMember(userId: string, enrollmentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const enrollment = await this.prisma.groupEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        group: true,
        student: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Group enrollment not found');
    }

    if (enrollment.group.createdBy !== user.student.id) {
      throw new ForbiddenException('Only group owner can remove members');
    }

    // Prevent removing the group owner
    if (enrollment.studentId === enrollment.group.createdBy) {
      throw new BadRequestException('Cannot remove the group owner');
    }

    // Delete the group enrollment
    await this.prisma.groupEnrollment.delete({
      where: { id: enrollmentId },
    });

    this.logger.log(
      `Member removed from group: ${enrollment.student.firstName} ${enrollment.student.lastName} from ${enrollment.group.name} by ${user.email}`,
    );

    return { message: 'Member successfully removed' };
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
