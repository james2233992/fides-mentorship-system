import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}