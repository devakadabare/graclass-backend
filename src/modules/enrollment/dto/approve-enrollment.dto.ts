import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '@prisma/client';

export class ApproveEnrollmentDto {
  @ApiProperty({
    description: 'Enrollment decision',
    enum: EnrollmentStatus,
    example: 'APPROVED',
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
