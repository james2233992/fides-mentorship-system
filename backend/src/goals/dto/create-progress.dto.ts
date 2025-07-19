import { IsString, IsOptional, IsInt, Min, Max, IsUrl } from 'class-validator';

export class CreateProgressDto {
  @IsString()
  description: string;

  @IsInt()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsOptional()
  @IsUrl()
  evidenceUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}