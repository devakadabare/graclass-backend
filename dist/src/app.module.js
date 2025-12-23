"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const lecturer_module_1 = require("./modules/lecturer/lecturer.module");
const student_module_1 = require("./modules/student/student.module");
const admin_module_1 = require("./modules/admin/admin.module");
const course_module_1 = require("./modules/course/course.module");
const availability_module_1 = require("./modules/availability/availability.module");
const class_module_1 = require("./modules/class/class.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const enrollment_module_1 = require("./modules/enrollment/enrollment.module");
const group_module_1 = require("./modules/group/group.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./modules/auth/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            lecturer_module_1.LecturerModule,
            student_module_1.StudentModule,
            admin_module_1.AdminModule,
            course_module_1.CourseModule,
            availability_module_1.AvailabilityModule,
            class_module_1.ClassModule,
            dashboard_module_1.DashboardModule,
            enrollment_module_1.EnrollmentModule,
            group_module_1.GroupModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map