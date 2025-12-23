import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
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
    getAllGroups(page: number, limit: number): Promise<{
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
    getGroupById(id: string): Promise<{
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
    joinGroup(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        groupId: string;
    }>;
    updateGroup(userId: string, id: string, dto: UpdateGroupDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        createdBy: string;
    }>;
    deleteGroup(userId: string, id: string): Promise<{
        message: string;
    }>;
}
