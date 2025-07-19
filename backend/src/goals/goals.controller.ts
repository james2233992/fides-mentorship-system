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
  Query,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalStatus, UserRole } from '@prisma/client';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto, @Request() req) {
    return this.goalsService.create(createGoalDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('status') status?: GoalStatus,
    @Query('category') category?: string,
    @Query('mentorId') mentorId?: string,
  ) {
    const filters = {
      status,
      category,
      mentorId,
    };

    return this.goalsService.findAll(
      req.user.userId,
      req.user.role as UserRole,
      filters,
    );
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.goalsService.getGoalStats(req.user.userId);
  }

  @Get('categories')
  getCategories() {
    return this.goalsService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.goalsService.findOne(
      id,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Request() req,
  ) {
    return this.goalsService.update(
      id,
      updateGoalDto,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.goalsService.remove(
      id,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  // Progress endpoints
  @Post(':id/progress')
  addProgress(
    @Param('id') goalId: string,
    @Body() createProgressDto: CreateProgressDto,
    @Request() req,
  ) {
    return this.goalsService.addProgress(
      goalId,
      createProgressDto,
      req.user.userId,
    );
  }

  @Get(':id/progress')
  getProgress(@Param('id') goalId: string, @Request() req) {
    return this.goalsService.getProgress(goalId, req.user.userId);
  }

  // Milestone endpoints
  @Post(':id/milestones')
  addMilestone(
    @Param('id') goalId: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
    @Request() req,
  ) {
    return this.goalsService.addMilestone(
      goalId,
      createMilestoneDto,
      req.user.userId,
    );
  }

  @Patch('milestones/:milestoneId')
  updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body('completed') completed: boolean,
    @Request() req,
  ) {
    return this.goalsService.updateMilestone(
      milestoneId,
      completed,
      req.user.userId,
    );
  }
}