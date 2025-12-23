import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { ApproveEnrollmentDto } from './dto/approve-enrollment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, EnrollmentStatus } from '@prisma/client';

@ApiTags('Enrollments')
@Controller('enrollments')
@Roles(UserRole.LECTURER)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all enrollments for lecturer courses' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EnrollmentStatus,
    description: 'Filter by enrollment status',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lecturer profile not found' })
  async getLecturerEnrollments(
    @CurrentUser('id') userId: string,
    @Query('status') status?: EnrollmentStatus,
    @Query('courseId') courseId?: string,
  ) {
    return this.enrollmentService.getLecturerEnrollments(
      userId,
      status,
      courseId,
    );
  }

  @Get('pending/count')
  @ApiOperation({ summary: 'Get pending enrollments count' })
  @ApiResponse({
    status: 200,
    description: 'Pending count retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lecturer profile not found' })
  async getPendingCount(@CurrentUser('id') userId: string) {
    return this.enrollmentService.getPendingEnrollmentsCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment details' })
  @ApiParam({
    name: 'id',
    description: 'Enrollment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to view this enrollment',
  })
  async getEnrollmentById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentService.getEnrollmentById(id, userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Approve or reject an enrollment' })
  @ApiParam({
    name: 'id',
    description: 'Enrollment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this enrollment',
  })
  @ApiResponse({
    status: 400,
    description: 'Enrollment already processed',
  })
  async updateEnrollmentStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ApproveEnrollmentDto,
  ) {
    return this.enrollmentService.updateEnrollmentStatus(
      id,
      userId,
      dto.status,
    );
  }
}
