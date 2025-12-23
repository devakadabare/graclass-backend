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
exports.ClassController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_service_1 = require("./class.service");
const create_class_dto_1 = require("./dto/create-class.dto");
const update_class_dto_1 = require("./dto/update-class.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ClassController = class ClassController {
    classService;
    constructor(classService) {
        this.classService = classService;
    }
    async createClass(userId, dto) {
        return this.classService.createClass(userId, dto);
    }
    async getMyClasses(userId, status, fromDate) {
        return this.classService.getLecturerClasses(userId, status, fromDate);
    }
    async getClassById(id, userId) {
        return this.classService.getClassById(id, userId);
    }
    async updateClass(id, userId, dto) {
        return this.classService.updateClass(id, userId, dto);
    }
    async cancelClass(id, userId) {
        return this.classService.cancelClass(id, userId);
    }
    async deleteClass(id, userId) {
        return this.classService.deleteClass(id, userId);
    }
};
exports.ClassController = ClassController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new class' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Class created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data provided' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_class_dto_1.CreateClassDto]),
    __metadata("design:returntype", Promise)
], ClassController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('my-classes'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all classes for current lecturer' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
        description: 'Filter by class status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'fromDate',
        required: false,
        type: String,
        description: 'Filter classes from this date (YYYY-MM-DD)',
        example: '2025-12-22',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Classes retrieved successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('fromDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ClassController.prototype, "getMyClasses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER, client_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get class by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Class ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to view this class',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassController.prototype, "getClassById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a class' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Class ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to update this class',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_class_dto_1.UpdateClassDto]),
    __metadata("design:returntype", Promise)
], ClassController.prototype, "updateClass", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a class' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Class ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class cancelled successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to cancel this class',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassController.prototype, "cancelClass", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a class' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Class ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to delete this class',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassController.prototype, "deleteClass", null);
exports.ClassController = ClassController = __decorate([
    (0, swagger_1.ApiTags)('Classes'),
    (0, common_1.Controller)('classes'),
    __metadata("design:paramtypes", [class_service_1.ClassService])
], ClassController);
//# sourceMappingURL=class.controller.js.map