import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get platform overview statistics' })
  @ApiResponse({ status: 200, description: 'Platform statistics' })
  getOverview() {
    return this.analyticsService.getOverviewStats();
  }

  @Get('users')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user growth statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'], description: 'Time period for statistics' })
  @ApiResponse({ status: 200, description: 'User growth statistics' })
  getUserStats(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.analyticsService.getUserGrowthStats(period || 'month');
  }

  @Get('sessions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'], description: 'Time period for statistics' })
  @ApiResponse({ status: 200, description: 'Session statistics' })
  getSessionStats(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.analyticsService.getSessionStats(period || 'month');
  }

  @Get('revenue')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'], description: 'Time period for statistics' })
  @ApiResponse({ status: 200, description: 'Revenue statistics' })
  getRevenueStats(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.analyticsService.getRevenueStats(period || 'month');
  }

  @Get('mentors')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get top performing mentors' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of mentors to return' })
  @ApiResponse({ status: 200, description: 'Top mentors list' })
  getTopMentors(@Query('limit') limit?: string) {
    return this.analyticsService.getTopMentors(limit ? parseInt(limit) : 10);
  }

  @Get('feedback')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get feedback statistics' })
  @ApiResponse({ status: 200, description: 'Feedback statistics' })
  getFeedbackStats() {
    return this.analyticsService.getFeedbackStats();
  }

  @Get('activity')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get platform activity heatmap data' })
  @ApiResponse({ status: 200, description: 'Activity heatmap data' })
  getActivityHeatmap() {
    return this.analyticsService.getActivityHeatmap();
  }
}