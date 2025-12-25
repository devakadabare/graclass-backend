import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private generateGroupCode;
    createGroup(userId: string, dto: CreateGroupDto): Promise<{
        creator: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    searchByGroupCode(groupCode: string): Promise<{
        memberCount: number;
        creator: {
            firstName: string;
            lastName: string;
        };
        _count: {
            members: number;
        };
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    getAllGroups(page?: number, limit?: number): Promise<{
        data: {
            memberCount: number;
            creator: {
                firstName: string;
                lastName: string;
            };
            _count: {
                members: number;
            };
            id: string;
            name: string;
            description: string | null;
            groupCode: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getGroupById(groupId: string): Promise<{
        creator: {
            user: {
                email: string;
            };
            firstName: string;
            lastName: string;
        };
        members: ({
            student: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            status: import(".prisma/client").$Enums.EnrollmentStatus;
            groupId: string;
            approvedByOwner: boolean;
            approvedAt: Date | null;
            rejectedAt: Date | null;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    getGroupDetails(groupId: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        creator: {
            id: string;
            user: {
                email: string;
            };
            firstName: string;
            lastName: string;
            university: string | null;
            studentId: string | null;
        };
        isCreator: boolean;
        isMember: boolean;
        membershipStatus: import(".prisma/client").$Enums.EnrollmentStatus | null;
        stats: {
            totalMembers: number;
            pendingRequests: number;
            enrolledCourses: number;
        };
        members: {
            enrollmentId: string;
            joinedAt: Date | null;
            student: {
                id: string;
                firstName: string;
                lastName: string;
                university: string | null;
                studentId: string | null;
                profileImage: string | null;
                email: string;
            };
        }[];
        pendingRequests: {
            enrollmentId: string;
            requestedAt: Date;
            student: {
                id: string;
                firstName: string;
                lastName: string;
                university: string | null;
                studentId: string | null;
                profileImage: string | null;
                email: string;
            };
        }[];
        enrolledCourses: {
            id: string;
            name: string;
            subject: string;
            enrolledAt: Date | null;
        }[];
    }>;
    getMyGroups(userId: string): Promise<{
        memberCount: number;
        _count: {
            members: number;
        };
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }[]>;
    getJoinedGroups(userId: string): Promise<{
        memberCount: number;
        creator: {
            firstName: string;
            lastName: string;
        };
        _count: {
            members: number;
        };
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }[]>;
    joinGroupByCode(userId: string, groupCode: string): Promise<{
        student: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        groupId: string;
        approvedByOwner: boolean;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }>;
    getPendingJoinRequests(userId: string): Promise<({
        student: {
            id: string;
            firstName: string;
            lastName: string;
            university: string | null;
        };
        group: {
            id: string;
            name: string;
            groupCode: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        groupId: string;
        approvedByOwner: boolean;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    })[]>;
    approveJoinRequest(userId: string, enrollmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        groupId: string;
        approvedByOwner: boolean;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }>;
    rejectJoinRequest(userId: string, enrollmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        groupId: string;
        approvedByOwner: boolean;
        approvedAt: Date | null;
        rejectedAt: Date | null;
    }>;
    removeMember(userId: string, enrollmentId: string): Promise<{
        message: string;
    }>;
    updateGroup(userId: string, groupId: string, dto: UpdateGroupDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        groupCode: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    deleteGroup(userId: string, groupId: string): Promise<{
        message: string;
    }>;
}
