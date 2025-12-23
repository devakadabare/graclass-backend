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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Student Groups')
@Controller('groups')
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student group' })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully',
  })
  async createGroup(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return this.groupService.createGroup(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active groups' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
  })
  async getAllGroups(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.groupService.getAllGroups(page, limit);
  }

  @Get('my-groups')
  @ApiOperation({ summary: 'Get groups created by me' })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
  })
  async getMyGroups(@CurrentUser('id') userId: string) {
    return this.groupService.getMyGroups(userId);
  }

  @Get('joined')
  @ApiOperation({ summary: 'Get groups I am a member of' })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
  })
  async getJoinedGroups(@CurrentUser('id') userId: string) {
    return this.groupService.getJoinedGroups(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Group details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async getGroupById(@Param('id') id: string) {
    return this.groupService.getGroupById(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a group' })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Join request submitted successfully',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 400, description: 'Already a member' })
  async joinGroup(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupService.joinGroup(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update group (creator only)' })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateGroup(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupService.updateGroup(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group (creator only)' })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Group deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async deleteGroup(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupService.deleteGroup(userId, id);
  }
}
