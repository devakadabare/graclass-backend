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

  @Get('pending-requests')
  @ApiOperation({ summary: 'Get pending join requests for my groups' })
  @ApiResponse({
    status: 200,
    description: 'Pending join requests retrieved successfully',
  })
  async getPendingJoinRequests(@CurrentUser('id') userId: string) {
    return this.groupService.getPendingJoinRequests(userId);
  }

  @Get('search/:groupCode')
  @ApiOperation({ summary: 'Search for a group by group code' })
  @ApiParam({
    name: 'groupCode',
    description: 'Group code',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 200,
    description: 'Group found successfully',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async searchByGroupCode(@Param('groupCode') groupCode: string) {
    return this.groupService.searchByGroupCode(groupCode);
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

  @Get(':id/details')
  @ApiOperation({
    summary:
      'Get detailed group information for popup/modal - includes group code, all members, pending requests (if owner), and enrolled courses',
  })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed group information retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Computer Science Study Group',
        description: 'Group for CS students studying together',
        groupCode: 'ABC123',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        creator: {
          id: 'creator-id',
          firstName: 'John',
          lastName: 'Doe',
          university: 'University of Example',
          studentId: 'STU001',
          email: 'john@example.com',
        },
        isCreator: true,
        isMember: true,
        membershipStatus: 'APPROVED',
        stats: {
          totalMembers: 5,
          pendingRequests: 2,
          enrolledCourses: 3,
        },
        members: [
          {
            enrollmentId: 'enrollment-id',
            joinedAt: '2024-01-01T00:00:00.000Z',
            student: {
              id: 'student-id',
              firstName: 'Jane',
              lastName: 'Smith',
              university: 'University of Example',
              studentId: 'STU002',
              profileImage: 'https://...',
              email: 'jane@example.com',
            },
          },
        ],
        pendingRequests: [],
        enrolledCourses: [
          {
            id: 'course-id',
            name: 'Introduction to Programming',
            subject: 'Computer Science',
            enrolledAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async getGroupDetails(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.groupService.getGroupDetails(id, userId);
  }

  @Post('join/:groupCode')
  @ApiOperation({ summary: 'Join a group using group code' })
  @ApiParam({
    name: 'groupCode',
    description: 'Group code',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 201,
    description: 'Join request submitted successfully',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 400, description: 'Already a member' })
  async joinGroup(
    @CurrentUser('id') userId: string,
    @Param('groupCode') groupCode: string,
  ) {
    return this.groupService.joinGroupByCode(userId, groupCode);
  }

  @Post('requests/:enrollmentId/approve')
  @ApiOperation({ summary: 'Approve a join request (group owner only)' })
  @ApiParam({
    name: 'enrollmentId',
    description: 'Group enrollment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Join request approved successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async approveJoinRequest(
    @CurrentUser('id') userId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.groupService.approveJoinRequest(userId, enrollmentId);
  }

  @Post('requests/:enrollmentId/reject')
  @ApiOperation({ summary: 'Reject a join request (group owner only)' })
  @ApiParam({
    name: 'enrollmentId',
    description: 'Group enrollment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Join request rejected successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async rejectJoinRequest(
    @CurrentUser('id') userId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.groupService.rejectJoinRequest(userId, enrollmentId);
  }

  @Delete('members/:enrollmentId')
  @ApiOperation({ summary: 'Remove a member from group (group owner only)' })
  @ApiParam({
    name: 'enrollmentId',
    description: 'Group enrollment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async removeMember(
    @CurrentUser('id') userId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.groupService.removeMember(userId, enrollmentId);
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
