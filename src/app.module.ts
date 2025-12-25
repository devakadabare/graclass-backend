import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { LecturerModule } from './modules/lecturer/lecturer.module';
import { StudentModule } from './modules/student/student.module';
import { AdminModule } from './modules/admin/admin.module';
import { CourseModule } from './modules/course/course.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ClassModule } from './modules/class/class.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { GroupModule } from './modules/group/group.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global Prisma module
    PrismaModule,
    // Global Common module
    CommonModule,
    // Health check module
    HealthModule,
    // Feature modules
    AuthModule,
    LecturerModule,
    StudentModule,
    AdminModule,
    CourseModule,
    AvailabilityModule,
    ClassModule,
    DashboardModule,
    EnrollmentModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
