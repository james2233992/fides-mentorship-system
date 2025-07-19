import { IsNotEmpty, IsString, IsUUID, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProposedScheduleDto {
  @ApiProperty({ description: 'Proposed date for the mentorship' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ description: 'Proposed time for the mentorship' })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsNotEmpty()
  duration: number;
}

export class CreateMentorshipRequestDto {
  @ApiProperty({ description: 'ID of the mentor to send the request to' })
  @IsNotEmpty()
  @IsUUID()
  mentorId: string;

  @ApiProperty({ description: 'Message to the mentor explaining the request' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Proposed schedule for the mentorship' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProposedScheduleDto)
  proposedSchedule?: ProposedScheduleDto;
}