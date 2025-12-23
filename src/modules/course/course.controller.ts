import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lecturer profile not found' })
  async createCourse(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.createCourse(userId, dto);
  }

  @Get('my-courses')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all courses for current lecturer' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive courses',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: [CourseResponseDto],
  })
  async getMyCourses(
    @CurrentUser('id') userId: string,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ) {
    return this.courseService.getLecturerCourses(userId, includeInactive);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search for courses' })
  @ApiQuery({
    name: 'subject',
    required: false,
    type: String,
    description: 'Filter by subject',
    example: 'Web Development',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    type: String,
    description: 'Filter by level',
    example: 'Beginner',
  })
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
    description: 'Courses search results',
  })
  async searchCourses(
    @Query('subject') subject?: string,
    @Query('level') level?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.courseService.searchCourses({ subject, level, page, limit });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.courseService.getCourseById(id, userId);
  }

  @Put(':id')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this course' })
  async updateCourse(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.updateCourse(id, userId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Course deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this course' })
  async deleteCourse(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.courseService.deleteCourse(id, userId);
  }
}
