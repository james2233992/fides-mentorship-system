import { 
  IsNotEmpty, 
  IsString, 
  IsUUID, 
  IsDateString, 
  IsInt, 
  Min, 
  Max, 
  IsOptional,
  MaxLength,
  MinLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'UUID of the mentor' })
  @IsNotEmpty({ message: 'Mentor ID is required' })
  @IsUUID('4', { message: 'Invalid mentor ID format' })
  mentorId: string;

  @ApiProperty({ description: 'UUID of the mentee' })
  @IsNotEmpty({ message: 'Mentee ID is required' })
  @IsUUID('4', { message: 'Invalid mentee ID format' })
  menteeId: string;

  @ApiProperty({ description: 'Title of the session' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({ description: 'Description of the session' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ description: 'Scheduled date and time in ISO format' })
  @IsNotEmpty({ message: 'Scheduled date is required' })
  @IsDateString({}, { message: 'Invalid date format' })
  scheduledAt: string;

  @ApiProperty({ description: 'Duration in minutes', minimum: 15, maximum: 240 })
  @IsNotEmpty({ message: 'Duration is required' })
  @IsInt({ message: 'Duration must be an integer' })
  @Min(15, { message: 'Session must be at least 15 minutes' })
  @Max(240, { message: 'Session cannot exceed 4 hours' })
  duration: number;
}