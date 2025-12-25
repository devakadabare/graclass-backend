"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LecturerController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const lecturer_service_1 = require("./lecturer.service");
const update_lecturer_profile_dto_1 = require("./dto/update-lecturer-profile.dto");
const lecturer_profile_response_dto_1 = require("./dto/lecturer-profile-response.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const create_student_dto_1 = require("./dto/create-student.dto");
const create_enrollment_dto_1 = require("./dto/create-enrollment.dto");
let LecturerController = class LecturerController {
    lecturerService;
    constructor(lecturerService) {
        this.lecturerService = lecturerService;
    }
    async getMyProfile(userId) {
        return this.lecturerService.getProfile(userId);
    }
    async updateProfile(userId, dto, file) {
        console.log('=== UPDATE PROFILE REQUEST ===');
        console.log('User ID:', userId);
        console.log('DTO:', dto);
        console.log('File received:', file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        } : 'NO FILE');
        console.log('==============================');
        return this.lecturerService.updateProfile(userId, dto, file);
    }
    async getPublicProfile(lecturerId) {
        return this.lecturerService.getPublicProfile(lecturerId);
    }
    async getAllLecturers(page, limit) {
        return this.lecturerService.getAllLecturers(page, limit);
    }
    async createStudent(lecturerId, dto) {
        return this.lecturerService.createStudent(lecturerId, dto);
    }
    async createEnrollment(lecturerId, dto) {
        return this.lecturerService.createEnrollment(lecturerId, dto);
    }
};
exports.LecturerController = LecturerController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current lecturer profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile retrieved successfully',
        type: lecturer_profile_response_dto_1.LecturerProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage')),
    (0, swagger_1.ApiOperation)({ summary: 'Update lecturer profile' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile updated successfully',
        type: lecturer_profile_response_dto_1.LecturerProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lecturer_profile_dto_1.UpdateLecturerProfileDto, Object]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "updateProfile", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/:lecturerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public lecturer profile' }),
    (0, swagger_1.ApiParam)({
        name: 'lecturerId',
        description: 'Lecturer ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Public profile retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lecturer not found' }),
    __param(0, (0, common_1.Param)('lecturerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "getPublicProfile", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active lecturers' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lecturers list retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "getAllLecturers", null);
__decorate([
    (0, common_1.Post)('students'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new student account (lecturer only)' }),
    (0, swagger_1.ApiBody)({ type: create_student_dto_1.CreateStudentDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Student account created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Student with this email already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only lecturers can create student accounts',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_student_dto_1.CreateStudentDto]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Post)('enrollments'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Directly enroll a student in a course (lecturer only)',
    }),
    (0, swagger_1.ApiBody)({ type: create_enrollment_dto_1.CreateEnrollmentDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Student enrolled successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Student, course, or lecturer not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Student already enrolled in this course',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to enroll students in this course',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_enrollment_dto_1.CreateEnrollmentDto]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "createEnrollment", null);
exports.LecturerController = LecturerController = __decorate([
    (0, swagger_1.ApiTags)('Lecturer'),
    (0, common_1.Controller)('lecturer'),
    __metadata("design:paramtypes", [lecturer_service_1.LecturerService])
], LecturerController);
//# sourceMappingURL=lecturer.controller.js.map