import { IsInt, IsString, IsBoolean, Min, Max, Matches, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilitySlotDto {
  @ApiProperty({ description: 'Day of week (0=Sunday, 1=Monday, etc.)', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:MM format', example: '09:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format', example: '17:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:MM format' })
  endTime: string;

  @ApiProperty({ description: 'Whether this is a recurring weekly slot', default: true })
  @IsBoolean()
  isRecurring: boolean = true;
}

export class CreateAvailabilityBulkDto {
  @ApiProperty({ type: [CreateAvailabilitySlotDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAvailabilitySlotDto)
  slots: CreateAvailabilitySlotDto[];
}