import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    description: 'Course ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({
    description: 'Student ID (for individual classes)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Student Group ID (for group classes)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  studentGroupId?: string;

  @ApiProperty({
    description: 'Class date (YYYY-MM-DD)',
    example: '2025-12-25',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Start time (HH:mm format)',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time (HH:mm format)',
    example: '12:00',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Meeting URL for online class',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional({
    description: 'Location for physical class',
    example: 'Room 101, Building A',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
