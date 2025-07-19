import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionStatus } from '@prisma/client';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}