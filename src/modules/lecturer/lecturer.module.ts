import { Module } from '@nestjs/common';
import { LecturerController } from './lecturer.controller';
import { LecturerService } from './lecturer.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LecturerController],
  providers: [LecturerService],
  exports: [LecturerService],
})
export class LecturerModule {}
