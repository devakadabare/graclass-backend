import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics for a lecturer
   */
  async getLecturerDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    const lecturerId = user.lecturer.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Get all statistics in parallel
    const [
      totalCourses,
      activeCourses,
      totalClasses,
      upcomingClasses,
      completedClasses,
      cancelledClasses,
      totalStudents,
      thisMonthClasses,
      thisWeekClasses,
      recentEnrollments,
      upcomingSchedule,
    ] = await Promise.all([
      // Total courses
      this.prisma.course.count({
        where: { lecturerId },
      }),
      // Active courses
      this.prisma.course.count({
        where: { lecturerId, isActive: true },
      }),
      // Total classes
      this.prisma.class.count({
        where: { lecturerId },
      }),
      // Upcoming classes
      this.prisma.class.count({
        where: {
          lecturerId,
          status: 'SCHEDULED',
          date: { gte: now },
        },
      }),
      // Completed classes
      this.prisma.class.count({
        where: {
          lecturerId,
          status: 'COMPLETED',
        },
      }),
      // Cancelled classes
      this.prisma.class.count({
        where: {
          lecturerId,
          status: 'CANCELLED',
        },
      }),
      // Total unique students (from enrollments)
      this.prisma.courseEnrollment
        .findMany({
          where: {
            course: { lecturerId },
            studentId: { not: null },
          },
          select: { studentId: true },
          distinct: ['studentId'],
        })
        .then((enrollments) => enrollments.length),
      // Classes this month
      this.prisma.class.count({
        where: {
          lecturerId,
          date: { gte: startOfMonth },
        },
      }),
      // Classes this week
      this.prisma.class.count({
        where: {
          lecturerId,
          date: { gte: startOfWeek },
        },
      }),
      // Recent enrollments (last 10)
      this.prisma.courseEnrollment.findMany({
        where: {
          course: { lecturerId },
        },
        take: 10,
        orderBy: { requestedAt: 'desc' },
        include: {
          course: {
            select: { name: true },
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
      }),
      // Upcoming schedule (next 7 days)
      this.prisma.class.findMany({
        where: {
          lecturerId,
          status: 'SCHEDULED',
          date: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        take: 10,
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
      }),
    ]);

    // Calculate earnings (mock calculation based on completed classes)
    const earningsData = await this.prisma.class.findMany({
      where: {
        lecturerId,
        status: 'COMPLETED',
      },
      include: {
        course: {
          select: {
            hourlyRate: true,
            duration: true,
          },
        },
      },
    });

    const totalEarnings = earningsData.reduce((sum, classData) => {
      const hours = classData.course.duration / 60;
      const rate = Number(classData.course.hourlyRate);
      return sum + hours * rate;
    }, 0);

    const thisMonthEarnings = earningsData
      .filter((c) => c.date >= startOfMonth)
      .reduce((sum, classData) => {
        const hours = classData.course.duration / 60;
        const rate = Number(classData.course.hourlyRate);
        return sum + hours * rate;
      }, 0);

    return {
      overview: {
        totalCourses,
        activeCourses,
        totalClasses,
        totalStudents,
        totalEarnings: totalEarnings.toFixed(2),
        thisMonthEarnings: thisMonthEarnings.toFixed(2),
      },
      classes: {
        upcoming: upcomingClasses,
        completed: completedClasses,
        cancelled: cancelledClasses,
        thisMonth: thisMonthClasses,
        thisWeek: thisWeekClasses,
      },
      recentActivity: {
        enrollments: recentEnrollments.map((e) => ({
          courseName: e.course.name,
          studentName: e.student
            ? `${e.student.firstName} ${e.student.lastName}`
            : null,
          groupName: e.studentGroup?.name || null,
          status: e.status,
          enrolledAt: e.requestedAt,
        })),
      },
      upcomingSchedule: upcomingSchedule.map((c) => ({
        id: c.id,
        courseName: c.course.name,
        subject: c.course.subject,
        studentName: c.student
          ? `${c.student.firstName} ${c.student.lastName}`
          : null,
        groupName: c.studentGroup?.name || null,
        classDate: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        meetingLink: c.meetingLink,
        location: c.location,
      })),
    };
  }

  /**
   * Get course-wise statistics
   */
  async getCourseStatistics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lecturer: true },
    });

    if (!user || !user.lecturer) {
      throw new NotFoundException('Lecturer profile not found');
    }

    const courses = await this.prisma.course.findMany({
      where: { lecturerId: user.lecturer.id },
      include: {
        _count: {
          select: {
            enrollments: true,
            classes: true,
          },
        },
        classes: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      id: course.id,
      name: course.name,
      subject: course.subject,
      level: course.level,
      isActive: course.isActive,
      totalEnrollments: course._count.enrollments,
      totalClasses: course._count.classes,
      completedClasses: course.classes.length,
      hourlyRate: Number(course.hourlyRate),
    }));
  }

  /**
   * Get dashboard statistics for a student
   */
  async getStudentDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student profile not found');
    }

    const studentId = user.student.id;
    const now = new Date();

    // Get all statistics in parallel
    const [
      totalEnrollments,
      approvedEnrollments,
      pendingEnrollments,
      totalClasses,
      upcomingClasses,
      completedClasses,
      upcomingSchedule,
    ] = await Promise.all([
      // Total enrollments
      this.prisma.courseEnrollment.count({
        where: { studentId },
      }),
      // Approved enrollments
      this.prisma.courseEnrollment.count({
        where: { studentId, status: 'APPROVED' },
      }),
      // Pending enrollments
      this.prisma.courseEnrollment.count({
        where: { studentId, status: 'PENDING' },
      }),
      // Total classes
      this.prisma.class.count({
        where: { studentId },
      }),
      // Upcoming classes
      this.prisma.class.count({
        where: {
          studentId,
          status: 'SCHEDULED',
          date: { gte: now },
        },
      }),
      // Completed classes
      this.prisma.class.count({
        where: {
          studentId,
          status: 'COMPLETED',
        },
      }),
      // Upcoming schedule (next 7 days)
      this.prisma.class.findMany({
        where: {
          studentId,
          status: 'SCHEDULED',
          date: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        take: 10,
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
      }),
    ]);

    // Get enrolled courses
    const enrolledCourses = await this.prisma.courseEnrollment.findMany({
      where: {
        studentId,
        status: 'APPROVED',
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            level: true,
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

    return {
      overview: {
        totalEnrollments,
        approvedEnrollments,
        pendingEnrollments,
        totalClasses,
      },
      classes: {
        upcoming: upcomingClasses,
        completed: completedClasses,
      },
      enrolledCourses: enrolledCourses.map((e) => ({
        courseName: e.course.name,
        subject: e.course.subject,
        level: e.course.level,
        lecturer: `${e.course.lecturer.firstName} ${e.course.lecturer.lastName}`,
        enrolledAt: e.approvedAt,
      })),
      upcomingSchedule: upcomingSchedule.map((c) => ({
        id: c.id,
        courseName: c.course.name,
        subject: c.course.subject,
        lecturer: `${c.lecturer.firstName} ${c.lecturer.lastName}`,
        classDate: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        meetingLink: c.meetingLink,
        location: c.location,
      })),
    };
  }
}
