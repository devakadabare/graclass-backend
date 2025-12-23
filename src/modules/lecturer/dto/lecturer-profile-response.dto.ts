import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LecturerProfileResponseDto {
  @ApiProperty({
    description: 'Lecturer ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Biography',
    example: 'Experienced software engineer with 10 years in web development',
  })
  @Expose()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Qualifications',
    example: 'PhD in Computer Science, AWS Certified Solutions Architect',
  })
  @Expose()
  qualifications?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Account status',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  @Expose()
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Account creation date',
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
