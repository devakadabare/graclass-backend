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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getLecturerDashboard(userId) {
        return this.dashboardService.getLecturerDashboard(userId);
    }
    async getCourseStatistics(userId) {
        return this.dashboardService.getCourseStatistics(userId);
    }
    async getStudentDashboard(userId) {
        return this.dashboardService.getStudentDashboard(userId);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('lecturer'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiOperation)({ summary: 'Get lecturer dashboard statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lecturer profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getLecturerDashboard", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LECTURER),
    (0, swagger_1.ApiOperation)({ summary: 'Get course-wise statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Course statistics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lecturer profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCourseStatistics", null);
__decorate([
    (0, common_1.Get)('student'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get student dashboard statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student profile not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStudentDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map