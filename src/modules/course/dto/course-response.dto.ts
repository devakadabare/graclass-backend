import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CourseResponseDto {
  @ApiProperty({
    description: 'Course ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Lecturer ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Expose()
  lecturerId: string;

  @ApiProperty({
    description: 'Course name',
    example: 'Introduction to Web Development',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Learn the fundamentals of web development',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Subject area',
    example: 'Web Development',
  })
  @Expose()
  subject: string;

  @ApiPropertyOptional({
    description: 'Course level',
    example: 'Beginner',
  })
  @Expose()
  level?: string;

  @ApiProperty({
    description: 'Session duration in minutes',
    example: 60,
  })
  @Expose()
  duration: number;

  @ApiProperty({
    description: 'Hourly rate',
    example: 50.0,
  })
  @Expose()
  hourlyRate: number;

  @ApiProperty({
    description: 'Whether the course is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-12-22T10:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-12-22T10:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
