import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { GoalStatus, Priority } from '@prisma/client';

export class CreateGoalDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsUUID()
  mentorId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;
}