import { IsNumber, IsString, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreateAvailabilityDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0-6 (Sunday-Saturday)

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}