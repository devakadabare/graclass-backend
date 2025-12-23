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
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const availability_service_1 = require("./availability.service");
const create_availability_dto_1 = require("./dto/create-availability.dto");
const update_availability_dto_1 = require("./dto/update-availability.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let AvailabilityController = class AvailabilityController {
    availabilityService;
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async createAvailability(userId, dto) {
        return this.availabilityService.createAvailability(userId, dto);
    }
    async getMyAvailability(userId, includeExpired) {
        return this.availabilityService.getLecturerAvailability(userId, includeExpired);
    }
    async getPublicAvailability(lecturerId) {
        return this.availabilityService.getPublicAvailability(lecturerId);
    }
    async updateAvailability(id, userId, dto) {
        return this.availabilityService.updateAvailability(id, userId, dto);
    }
    async deleteAvailability(id, userId) {
        return this.availabilityService.deleteAvailability(id, userId);
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create availability slot' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Availability created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data provided' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_availability_dto_1.CreateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "createAvailability", null);
__decorate([
    (0, common_1.Get)('my-availability'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get own availability slots' }),
    (0, swagger_1.ApiQuery)({
        name: 'includeExpired',
        required: false,
        type: Boolean,
        description: 'Include expired one-time availabilities',
        example: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability slots retrieved successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('includeExpired', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getMyAvailability", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('lecturer/:lecturerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public availability for a lecturer' }),
    (0, swagger_1.ApiParam)({
        name: 'lecturerId',
        description: 'Lecturer ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lecturer not found' }),
    __param(0, (0, common_1.Param)('lecturerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getPublicAvailability", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update availability slot' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Availability ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Availability not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to update this availability',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_availability_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete availability slot' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Availability ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Availability not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to delete this availability',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "deleteAvailability", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('Availability'),
    (0, common_1.Controller)('availability'),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map