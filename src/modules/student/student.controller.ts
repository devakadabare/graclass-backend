import { Controller, Get, Put, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, EnrollmentStatus } from '@prisma/client';

@ApiTags('Student')
@Controller('student')
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.studentService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentService.updateProfile(userId, dto);
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({
    status: 201,
    description: 'Enrollment request submitted successfully',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Already enrolled' })
  async enrollInCourse(
    @CurrentUser('id') userId: string,
    @Body() dto: EnrollCourseDto,
  ) {
    return this.studentService.enrollInCourse(userId, dto);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get my enrollments' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EnrollmentStatus,
    description: 'Filter by enrollment status',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
  })
  async getMyEnrollments(
    @CurrentUser('id') userId: string,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.studentService.getMyEnrollments(userId, status);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get enrolled courses (approved only)' })
  @ApiResponse({
    status: 200,
    description: 'Enrolled courses retrieved successfully',
  })
  async getEnrolledCourses(@CurrentUser('id') userId: string) {
    return this.studentService.getEnrolledCourses(userId);
  }

  @Get('classes')
  @ApiOperation({ summary: 'Get my scheduled classes' })
  @ApiQuery({
    name: 'upcoming',
    required: false,
    type: Boolean,
    description: 'Filter for upcoming classes only',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
  })
  async getMyClasses(
    @CurrentUser('id') userId: string,
    @Query('upcoming') upcoming?: boolean,
  ) {
    return this.studentService.getMyClasses(userId, upcoming ?? true);
  }
}
