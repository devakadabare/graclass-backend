import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MinLength,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course name',
    example: 'Introduction to Web Development',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Subject area',
    example: 'Web Development',
  })
  @IsString()
  @MinLength(2)
  subject: string;

  @ApiPropertyOptional({
    description: 'Course level',
    example: 'Beginner',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({
    description: 'Session duration in minutes',
    example: 60,
    minimum: 15,
  })
  @IsNumber()
  @Min(15)
  @Type(() => Number)
  duration: number;

  @ApiProperty({
    description: 'Hourly rate in USD',
    example: 50.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  hourlyRate: number;
}
