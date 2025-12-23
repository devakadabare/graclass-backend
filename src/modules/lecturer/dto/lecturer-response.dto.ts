import { ApiProperty } from '@nestjs/swagger';

export class LecturerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  qualifications?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
  };
}
