import { PartialType } from '@nestjs/mapped-types';
import { CreateGoalDto } from './create-goal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { GoalStatus } from '@prisma/client';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}