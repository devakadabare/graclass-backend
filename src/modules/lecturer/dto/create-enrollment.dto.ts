import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Course ID',
  })
  @IsUUID()
  courseId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description:
      'Student ID (either studentId or studentGroupId must be provided)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description:
      'Student Group ID (either studentId or studentGroupId must be provided)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  studentGroupId?: string;

  @ApiProperty({
    example: 'Direct enrollment by lecturer',
    description: 'Notes or reason for enrollment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
