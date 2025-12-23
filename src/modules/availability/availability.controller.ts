import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create availability slot' })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  async createAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createAvailability(userId, dto);
  }

  @Get('my-availability')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own availability slots' })
  @ApiQuery({
    name: 'includeExpired',
    required: false,
    type: Boolean,
    description: 'Include expired one-time availabilities',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Availability slots retrieved successfully',
  })
  async getMyAvailability(
    @CurrentUser('id') userId: string,
    @Query('includeExpired', new DefaultValuePipe(false), ParseBoolPipe)
    includeExpired: boolean,
  ) {
    return this.availabilityService.getLecturerAvailability(
      userId,
      includeExpired,
    );
  }

  @Public()
  @Get('lecturer/:lecturerId')
  @ApiOperation({ summary: 'Get public availability for a lecturer' })
  @ApiParam({
    name: 'lecturerId',
    description: 'Lecturer ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async getPublicAvailability(@Param('lecturerId') lecturerId: string) {
    return this.availabilityService.getPublicAvailability(lecturerId);
  }

  @Put(':id')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability slot' })
  @ApiParam({
    name: 'id',
    description: 'Availability ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this availability',
  })
  async updateAvailability(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(id, userId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete availability slot' })
  @ApiParam({
    name: 'id',
    description: 'Availability ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to delete this availability',
  })
  async deleteAvailability(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.availabilityService.deleteAvailability(id, userId);
  }
}
