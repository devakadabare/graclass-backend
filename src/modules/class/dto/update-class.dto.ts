import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  IsEnum,
} from 'class-validator';
import { ClassStatus } from '@prisma/client';

export class UpdateClassDto {
  @ApiPropertyOptional({
    description: 'Class date (YYYY-MM-DD)',
    example: '2025-12-26',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Start time (HH:mm format)',
    example: '11:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (HH:mm format)',
    example: '13:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Meeting URL',
    example: 'https://zoom.us/j/123456789',
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional({
    description: 'Physical location',
    example: 'Room 202, Building B',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Class status',
    enum: ClassStatus,
    example: 'COMPLETED',
  })
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}
