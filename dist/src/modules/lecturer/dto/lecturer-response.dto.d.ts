export declare class LecturerResponseDto {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    bio?: string;
    qualifications?: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        isEmailVerified: boolean;
    };
}
