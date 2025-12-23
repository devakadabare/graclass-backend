import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Course name',
    example: 'Introduction to Web Development',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Learn the fundamentals of web development',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Subject area',
    example: 'Web Development',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  subject?: string;

  @ApiPropertyOptional({
    description: 'Course level',
    example: 'Intermediate',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    description: 'Session duration in minutes',
    example: 90,
    minimum: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Hourly rate in USD',
    example: 75.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  hourlyRate?: number;

  @ApiPropertyOptional({
    description: 'Whether the course is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
