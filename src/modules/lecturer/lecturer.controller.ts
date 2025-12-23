import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LecturerService } from './lecturer.service';
import { UpdateLecturerProfileDto } from './dto/update-lecturer-profile.dto';
import { LecturerProfileResponseDto } from './dto/lecturer-profile-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@ApiTags('Lecturer')
@Controller('lecturer')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get('profile')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current lecturer profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: LecturerProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.lecturerService.getProfile(userId);
  }

  @Put('profile')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lecturer profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: LecturerProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLecturerProfileDto,
  ) {
    return this.lecturerService.updateProfile(userId, dto);
  }

  @Public()
  @Get('public/:lecturerId')
  @ApiOperation({ summary: 'Get public lecturer profile' })
  @ApiParam({
    name: 'lecturerId',
    description: 'Lecturer ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async getPublicProfile(@Param('lecturerId') lecturerId: string) {
    return this.lecturerService.getPublicProfile(lecturerId);
  }

  @Public()
  @Get('list')
  @ApiOperation({ summary: 'Get all active lecturers' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lecturers list retrieved successfully',
  })
  async getAllLecturers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.lecturerService.getAllLecturers(page, limit);
  }

  @Post('students')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new student account (lecturer only)' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    description: 'Student account created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Student with this email already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Only lecturers can create student accounts',
  })
  async createStudent(
    @CurrentUser('id') lecturerId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.lecturerService.createStudent(lecturerId, dto);
  }

  @Post('enrollments')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Directly enroll a student in a course (lecturer only)',
  })
  @ApiBody({ type: CreateEnrollmentDto })
  @ApiResponse({
    status: 201,
    description: 'Student enrolled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student, course, or lecturer not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Student already enrolled in this course',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to enroll students in this course',
  })
  async createEnrollment(
    @CurrentUser('id') lecturerId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.lecturerService.createEnrollment(lecturerId, dto);
  }
}
