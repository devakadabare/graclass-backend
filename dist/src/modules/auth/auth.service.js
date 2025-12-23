"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async registerLecturer(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: client_1.UserRole.LECTURER,
                isActive: true,
                isEmailVerified: false,
                lecturer: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        phone: dto.phone,
                        bio: dto.bio,
                        qualifications: dto.qualifications,
                    },
                },
            },
            include: {
                lecturer: true,
            },
        });
        this.logger.log(`New lecturer registered: ${user.email}`);
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.lecturer.firstName,
                lastName: user.lecturer.lastName,
            },
        };
    }
    async registerStudent(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: client_1.UserRole.STUDENT,
                isActive: true,
                isEmailVerified: false,
                student: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        phone: dto.phone,
                        university: dto.university,
                        studentId: dto.studentId,
                    },
                },
            },
            include: {
                student: true,
            },
        });
        this.logger.log(`New student registered: ${user.email}`);
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.student.firstName,
                lastName: user.student.lastName,
            },
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                lecturer: true,
                student: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.logger.log(`User logged in: ${user.email}`);
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        let firstName = '';
        let lastName = '';
        if (user.role === client_1.UserRole.LECTURER && user.lecturer) {
            firstName = user.lecturer.firstName;
            lastName = user.lecturer.lastName;
        }
        else if (user.role === client_1.UserRole.STUDENT && user.student) {
            firstName = user.student.firstName;
            lastName = user.student.lastName;
        }
        else if (user.role === client_1.UserRole.ADMIN) {
            firstName = 'Admin';
            lastName = 'User';
        }
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName,
                lastName,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateTokens(user.id, user.email, user.role);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTokens(userId, email, role) {
        const payload = {
            sub: userId,
            email,
            role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '1h',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                lecturer: true,
                student: true,
            },
        });
        if (!user || !user.isActive) {
            return null;
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map