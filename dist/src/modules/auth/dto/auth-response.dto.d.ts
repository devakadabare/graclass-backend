import { UserRole } from '@prisma/client';
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
    };
}
