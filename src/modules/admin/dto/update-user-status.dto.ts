import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
