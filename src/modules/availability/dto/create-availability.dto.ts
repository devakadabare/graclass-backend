import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsString,
  Matches,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Whether this is a recurring availability',
    example: true,
  })
  @IsBoolean()
  isRecurring: boolean;

  @ApiPropertyOptional({
    description:
      'Day of week for recurring availability (0=Sunday, 6=Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @ValidateIf((o) => o.isRecurring === true)
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  dayOfWeek?: number;

  @ApiPropertyOptional({
    description: 'Specific date for one-time availability (YYYY-MM-DD)',
    example: '2025-12-25',
  })
  @ValidateIf((o) => o.isRecurring === false)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'specificDate must be in YYYY-MM-DD format',
  })
  specificDate?: string;

  @ApiProperty({
    description: 'Start time (HH:mm format)',
    example: '09:00',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time (HH:mm format)',
    example: '17:00',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;
}
