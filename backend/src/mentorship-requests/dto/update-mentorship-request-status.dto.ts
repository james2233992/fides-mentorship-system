import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class UpdateMentorshipRequestStatusDto {
  @ApiProperty({ enum: RequestStatus, description: 'New status for the request' })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiPropertyOptional({ description: 'Response message from the mentor' })
  @IsOptional()
  @IsString()
  responseMessage?: string;
}