import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async createClass(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClassDto,
  ) {
    return this.classService.createClass(userId, dto);
  }

  @Get('my-classes')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all classes for current lecturer' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    description: 'Filter by class status',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Filter classes from this date (YYYY-MM-DD)',
    example: '2025-12-22',
  })
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
  })
  async getMyClasses(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
  ) {
    return this.classService.getLecturerClasses(userId, status, fromDate);
  }

  @Get(':id')
  @Roles(UserRole.LECTURER, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get class by ID' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Class retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to view this class',
  })
  async getClassById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.classService.getClassById(id, userId);
  }

  @Put(':id')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a class' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this class',
  })
  async updateClass(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classService.updateClass(id, userId, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a class' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Class cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to cancel this class',
  })
  async cancelClass(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.classService.cancelClass(id, userId);
  }

  @Delete(':id')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a class' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to delete this class',
  })
  async deleteClass(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.classService.deleteClass(id, userId);
  }
}
