import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Group name',
    example: 'Advanced Math Study Group',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Group description',
    example: 'A study group for students taking advanced mathematics courses',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
