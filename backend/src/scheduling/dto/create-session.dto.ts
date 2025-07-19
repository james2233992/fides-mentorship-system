import { IsString, IsDate, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @IsUUID()
  mentorId: string;

  @IsUUID()
  menteeId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  scheduledAt: Date;

  @IsNumber()
  @Min(15)
  @Max(180)
  duration: number; // in minutes

  @IsString()
  @IsOptional()
  meetingLink?: string;
}