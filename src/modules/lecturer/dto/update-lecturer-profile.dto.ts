import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateLecturerProfileDto {
  @ApiProperty({
    description: 'First name of the lecturer',
    example: 'John',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the lecturer',
    example: 'Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Biography of the lecturer',
    example: 'Experienced software engineer with 10 years in web development',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Qualifications and certifications',
    example: 'PhD in Computer Science, AWS Certified Solutions Architect',
  })
  @IsOptional()
  @IsString()
  qualifications?: string;
}
