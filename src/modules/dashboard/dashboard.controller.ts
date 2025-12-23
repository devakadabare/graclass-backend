import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('lecturer')
  @Roles(UserRole.LECTURER)
  @ApiOperation({ summary: 'Get lecturer dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lecturer profile not found' })
  async getLecturerDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getLecturerDashboard(userId);
  }

  @Get('courses')
  @Roles(UserRole.LECTURER)
  @ApiOperation({ summary: 'Get course-wise statistics' })
  @ApiResponse({
    status: 200,
    description: 'Course statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lecturer profile not found' })
  async getCourseStatistics(@CurrentUser('id') userId: string) {
    return this.dashboardService.getCourseStatistics(userId);
  }

  @Get('student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  async getStudentDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStudentDashboard(userId);
  }
}
