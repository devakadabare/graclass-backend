import { AuthService } from './auth.service';
import { RegisterLecturerDto } from './dto/register-lecturer.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerLecturer(dto: RegisterLecturerDto): Promise<AuthResponseDto>;
    registerStudent(dto: RegisterStudentDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
