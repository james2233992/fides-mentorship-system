import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MentorshipRequestsService } from './mentorship-requests.service';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { UpdateMentorshipRequestStatusDto } from './dto/update-mentorship-request-status.dto';
import { MentorshipRequestResponseDto } from './dto/mentorship-request-response.dto';

@ApiTags('mentorship-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mentorship-requests')
export class MentorshipRequestsController {
  constructor(private readonly mentorshipRequestsService: MentorshipRequestsService) {}

  @Post()
  @Roles(UserRole.MENTEE)
  @ApiOperation({ summary: 'Create a new mentorship request' })
  @ApiResponse({ status: 201, description: 'Mentorship request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Mentor not found' })
  create(
    @Request() req,
    @Body() createDto: CreateMentorshipRequestDto,
  ): Promise<MentorshipRequestResponseDto> {
    return this.mentorshipRequestsService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all mentorship requests for the current user' })
  @ApiResponse({ status: 200, description: 'List of mentorship requests' })
  findAll(@Request() req): Promise<MentorshipRequestResponseDto[]> {
    return this.mentorshipRequestsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific mentorship request' })
  @ApiResponse({ status: 200, description: 'Mentorship request details' })
  @ApiResponse({ status: 404, description: 'Mentorship request not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<MentorshipRequestResponseDto> {
    return this.mentorshipRequestsService.findOne(id, req.user.userId);
  }

  @Patch(':id/accept')
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a mentorship request' })
  @ApiResponse({ status: 200, description: 'Mentorship request accepted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Mentorship request not found' })
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { responseMessage?: string },
  ): Promise<MentorshipRequestResponseDto> {
    const updateDto: UpdateMentorshipRequestStatusDto = {
      status: 'ACCEPTED',
      responseMessage: body.responseMessage,
    };
    return this.mentorshipRequestsService.updateStatus(id, req.user.userId, updateDto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a mentorship request' })
  @ApiResponse({ status: 200, description: 'Mentorship request rejected' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Mentorship request not found' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { responseMessage?: string },
  ): Promise<MentorshipRequestResponseDto> {
    const updateDto: UpdateMentorshipRequestStatusDto = {
      status: 'REJECTED',
      responseMessage: body.responseMessage,
    };
    return this.mentorshipRequestsService.updateStatus(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.MENTEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a pending mentorship request' })
  @ApiResponse({ status: 204, description: 'Mentorship request cancelled' })
  @ApiResponse({ status: 404, description: 'Mentorship request not found' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    return this.mentorshipRequestsService.cancel(id, req.user.userId);
  }
}