import { RequestStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MentorshipRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menteeId: string;

  @ApiProperty()
  mentorId: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: RequestStatus })
  status: RequestStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Mentor user details' })
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    expertise?: string;
    bio?: string;
    rating?: number;
    totalSessions?: number;
  };

  @ApiProperty({ description: 'Mentee user details' })
  mentee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ required: false })
  proposedSchedule?: {
    date: string;
    time: string;
    duration: number;
  };
}