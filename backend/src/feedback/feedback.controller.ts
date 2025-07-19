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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@ApiTags('feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create feedback for a session' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.create(createFeedbackDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({ status: 200, description: 'List of feedback.' })
  findAll(@Request() req) {
    return this.feedbackService.findAll(req.user.userId, req.user.role);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get sessions awaiting feedback' })
  @ApiResponse({ status: 200, description: 'List of sessions awaiting feedback.' })
  getSessionsAwaitingFeedback(@Request() req) {
    return this.feedbackService.getSessionsAwaitingFeedback(req.user.userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get feedback for a specific session' })
  @ApiResponse({ status: 200, description: 'Feedback found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Feedback not found.' })
  findBySession(@Param('sessionId') sessionId: string, @Request() req) {
    return this.feedbackService.findBySession(sessionId, req.user.userId);
  }

  @Get('mentor/:mentorId/stats')
  @ApiOperation({ summary: 'Get mentor rating statistics' })
  @ApiResponse({ status: 200, description: 'Mentor statistics.' })
  getMentorStats(@Param('mentorId') mentorId: string) {
    return this.feedbackService.getMentorStats(mentorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Feedback not found.' })
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Request() req,
  ) {
    return this.feedbackService.update(id, updateFeedbackDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback (Admin only)' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Feedback not found.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.feedbackService.remove(id, req.user.userId);
  }
}