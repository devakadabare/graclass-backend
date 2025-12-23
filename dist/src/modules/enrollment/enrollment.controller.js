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
exports.EnrollmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enrollment_service_1 = require("./enrollment.service");
const approve_enrollment_dto_1 = require("./dto/approve-enrollment.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let EnrollmentController = class EnrollmentController {
    enrollmentService;
    constructor(enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    async getLecturerEnrollments(userId, status, courseId) {
        return this.enrollmentService.getLecturerEnrollments(userId, status, courseId);
    }
    async getPendingCount(userId) {
        return this.enrollmentService.getPendingEnrollmentsCount(userId);
    }
    async getEnrollmentById(id, userId) {
        return this.enrollmentService.getEnrollmentById(id, userId);
    }
    async updateEnrollmentStatus(id, userId, dto) {
        return this.enrollmentService.updateEnrollmentStatus(id, userId, dto.status);
    }
};
exports.EnrollmentController = EnrollmentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all enrollments for lecturer courses' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: client_1.EnrollmentStatus,
        description: 'Filter by enrollment status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'courseId',
        required: false,
        type: String,
        description: 'Filter by course ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrollments retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lecturer profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getLecturerEnrollments", null);
__decorate([
    (0, common_1.Get)('pending/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending enrollments count' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending count retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lecturer profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getPendingCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrollment details' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Enrollment ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrollment details retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrollment not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to view this enrollment',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getEnrollmentById", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject an enrollment' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Enrollment ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Enrollment status updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrollment not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to update this enrollment',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Enrollment already processed',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, approve_enrollment_dto_1.ApproveEnrollmentDto]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "updateEnrollmentStatus", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, swagger_1.ApiTags)('Enrollments'),
    (0, common_1.Controller)('enrollments'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map