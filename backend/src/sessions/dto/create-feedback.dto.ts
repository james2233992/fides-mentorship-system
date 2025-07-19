import { IsNotEmpty, IsInt, Min, Max, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Written feedback from the mentee' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UpdateSessionNotesDto {
  @ApiProperty({ description: 'Session notes visible to both mentor and mentee' })
  @IsNotEmpty()
  @IsString()
  notes: string;
}

export class UpdateMentorNotesDto {
  @ApiProperty({ description: 'Private notes from the mentor' })
  @IsNotEmpty()
  @IsString()
  mentorNotes: string;
}