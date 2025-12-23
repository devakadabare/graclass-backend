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
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const student_service_1 = require("./student.service");
const update_student_profile_dto_1 = require("./dto/update-student-profile.dto");
const enroll_course_dto_1 = require("./dto/enroll-course.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let StudentController = class StudentController {
    studentService;
    constructor(studentService) {
        this.studentService = studentService;
    }
    async getMyProfile(userId) {
        return this.studentService.getProfile(userId);
    }
    async updateProfile(userId, dto) {
        return this.studentService.updateProfile(userId, dto);
    }
    async enrollInCourse(userId, dto) {
        return this.studentService.enrollInCourse(userId, dto);
    }
    async getMyEnrollments(userId, status) {
        return this.studentService.getMyEnrollments(userId, status);
    }
    async getEnrolledCourses(userId) {
        return this.studentService.getEnrolledCourses(userId);
    }
    async getMyClasses(userId, upcoming) {
        return this.studentService.getMyClasses(userId, upcoming ?? true);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current student profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update student profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_profile_dto_1.UpdateStudentProfileDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('enroll'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll in a course' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Enrollment request submitted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Already enrolled' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enroll_course_dto_1.EnrollCourseDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "enrollInCourse", null);
__decorate([
    (0, common_1.Get)('enrollments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my enrollments' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: client_1.EnrollmentStatus,
        description: 'Filter by enrollment status',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrollments retrieved successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getMyEnrollments", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrolled courses (approved only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrolled courses retrieved successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getEnrolledCourses", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my scheduled classes' }),
    (0, swagger_1.ApiQuery)({
        name: 'upcoming',
        required: false,
        type: Boolean,
        description: 'Filter for upcoming classes only',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Classes retrieved successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('upcoming')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getMyClasses", null);
exports.StudentController = StudentController = __decorate([
    (0, swagger_1.ApiTags)('Student'),
    (0, common_1.Controller)('student'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
//# sourceMappingURL=student.controller.js.map