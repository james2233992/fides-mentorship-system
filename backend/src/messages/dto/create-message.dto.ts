import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @ApiProperty({ description: 'Message content', maxLength: 1000 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}