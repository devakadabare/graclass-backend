import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentProfileDto {
  @ApiProperty({ example: 'Jane', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'University of California', required: false })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiProperty({ example: 'STU12345', required: false })
  @IsOptional()
  @IsString()
  studentId?: string;
}
