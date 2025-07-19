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
  BadRequestException,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionStatus } from '@prisma/client';
import { CreateFeedbackDto, UpdateSessionNotesDto, UpdateMentorNotesDto } from './dto/create-feedback.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mentorship session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Request() req,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    // Convert string date to Date object
    const scheduledAt = new Date(createSessionDto.scheduledAt);
    
    // Additional validation: ensure scheduled date is in the future
    if (scheduledAt <= new Date()) {
      throw new BadRequestException('Session must be scheduled in the future');
    }

    return this.sessionsService.create({
      ...createSessionDto,
      scheduledAt,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.sessionsService.findAll(
      req.user.userId, 
      req.user.role,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.sessionsService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSessionDto: any,
  ) {
    // Convert string date to Date object if present
    if (updateSessionDto.scheduledAt) {
      const scheduledAt = new Date(updateSessionDto.scheduledAt);
      if (isNaN(scheduledAt.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      updateSessionDto.scheduledAt = scheduledAt;
    }

    return this.sessionsService.update(
      id,
      req.user.userId,
      req.user.role,
      updateSessionDto,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: SessionStatus,
  ) {
    return this.sessionsService.updateStatus(
      id,
      req.user.userId,
      req.user.role,
      status,
    );
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.sessionsService.delete(id, req.user.userId, req.user.role);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Add feedback to a completed session' })
  @ApiResponse({ status: 201, description: 'Feedback added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async addFeedback(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.sessionsService.addFeedback(
      id,
      req.user.userId,
      createFeedbackDto,
    );
  }

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Get feedback for a session' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session or feedback not found' })
  async getFeedback(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.getFeedback(id, req.user.userId);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update session notes (visible to both parties)' })
  @ApiResponse({ status: 200, description: 'Notes updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateNotes(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotesDto: UpdateSessionNotesDto,
  ) {
    return this.sessionsService.updateNotes(
      id,
      req.user.userId,
      req.user.role,
      updateNotesDto.notes,
    );
  }

  @Patch(':id/mentor-notes')
  @ApiOperation({ summary: 'Update private mentor notes' })
  @ApiResponse({ status: 200, description: 'Mentor notes updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized (mentor only)' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateMentorNotes(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMentorNotesDto: UpdateMentorNotesDto,
  ) {
    return this.sessionsService.updateMentorNotes(
      id,
      req.user.userId,
      updateMentorNotesDto.mentorNotes,
    );
  }
}