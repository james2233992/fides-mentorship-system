import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReadDto {
  @ApiProperty({ description: 'Array of message IDs to mark as read', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  messageIds: string[];
}