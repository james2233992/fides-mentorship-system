import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('scheduling')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  // Session endpoints
  @Post('sessions')
  createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.schedulingService.createSession(createSessionDto);
  }

  @Get('sessions')
  findAllSessions(
    @CurrentUser() user,
    @Query('userId') userId?: string,
  ) {
    const targetUserId = userId || user.userId;
    return this.schedulingService.findAllSessions(targetUserId, user.role);
  }

  @Get('sessions/:id')
  findOneSession(@Param('id') id: string) {
    return this.schedulingService.findOneSession(id);
  }

  @Patch('sessions/:id')
  updateSession(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @CurrentUser() user,
  ) {
    return this.schedulingService.updateSession(id, updateSessionDto, user.userId);
  }

  @Delete('sessions/:id')
  cancelSession(@Param('id') id: string, @CurrentUser() user) {
    return this.schedulingService.cancelSession(id, user.userId);
  }

  // Availability endpoints
  @Post('availability')
  createAvailability(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @CurrentUser() user,
  ) {
    return this.schedulingService.createAvailability(user.userId, createAvailabilityDto);
  }

  @Get('availability/:userId')
  findUserAvailability(@Param('userId') userId: string) {
    return this.schedulingService.findUserAvailability(userId);
  }

  @Patch('availability/:id')
  updateAvailability(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAvailabilityDto>,
    @CurrentUser() user,
  ) {
    return this.schedulingService.updateAvailability(id, user.userId, updateData);
  }

  @Delete('availability/:id')
  deleteAvailability(@Param('id') id: string, @CurrentUser() user) {
    return this.schedulingService.deleteAvailability(id, user.userId);
  }
}