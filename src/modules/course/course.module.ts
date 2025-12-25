import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { S3Service } from '../../common/services/s3.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourseController],
  providers: [CourseService, S3Service],
  exports: [CourseService],
})
export class CourseModule {}
