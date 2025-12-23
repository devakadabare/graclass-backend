import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createGroup(userId: string, dto: CreateGroupDto): Promise<{
        creator: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
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
                enrollments: number;
            };
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
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
        enrollments: ({
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
        })[];
        creator: {
            user: {
                email: string;
            };
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        createdBy: string;
    }>;
    getMyGroups(userId: string): Promise<{
        memberCount: number;
        _count: {
            enrollments: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        createdBy: string;
    }[]>;
    getJoinedGroups(userId: string): Promise<{
        memberCount: number;
        creator: {
            firstName: string;
            lastName: string;
        };
        _count: {
            enrollments: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        createdBy: string;
    }[]>;
    joinGroup(userId: string, groupId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        groupId: string;
    }>;
    updateGroup(userId: string, groupId: string, dto: UpdateGroupDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        createdBy: string;
    }>;
    deleteGroup(userId: string, groupId: string): Promise<{
        message: string;
    }>;
}
