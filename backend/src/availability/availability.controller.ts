import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilitySlotDto, CreateAvailabilityBulkDto } from './dto/create-availability.dto';

@ApiTags('availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('MENTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create availability slot' })
  @ApiResponse({ status: 201, description: 'Availability slot created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(
    @Request() req,
    @Body() createAvailabilityDto: CreateAvailabilitySlotDto,
  ) {
    return this.availabilityService.create(req.user.userId, createAvailabilityDto);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles('MENTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create multiple availability slots' })
  @ApiResponse({ status: 201, description: 'Availability slots created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  createBulk(
    @Request() req,
    @Body() createAvailabilityBulkDto: CreateAvailabilityBulkDto,
  ) {
    return this.availabilityService.createBulk(req.user.userId, createAvailabilityBulkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user availability' })
  @ApiResponse({ status: 200, description: 'List of availability slots.' })
  findAll(@Request() req) {
    return this.availabilityService.findAll(req.user.userId);
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Get mentor availability' })
  @ApiResponse({ status: 200, description: 'List of mentor availability slots.' })
  @ApiResponse({ status: 404, description: 'Mentor not found.' })
  findByMentor(@Param('mentorId') mentorId: string) {
    return this.availabilityService.findByMentor(mentorId);
  }

  @Get('mentor/:mentorId/slots')
  @ApiOperation({ summary: 'Get available time slots for a specific date' })
  @ApiResponse({ status: 200, description: 'List of available time slots.' })
  @ApiQuery({ name: 'date', required: true, type: String, description: 'Date in YYYY-MM-DD format' })
  getAvailableSlots(
    @Param('mentorId') mentorId: string,
    @Query('date') date: string,
  ) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return this.availabilityService.getAvailableSlots(mentorId, parsedDate);
  }

  @Delete()
  @UseGuards(RolesGuard)
  @Roles('MENTOR', 'ADMIN')
  @ApiOperation({ summary: 'Delete all availability slots' })
  @ApiResponse({ status: 200, description: 'All availability slots deleted.' })
  removeAll(@Request() req) {
    return this.availabilityService.removeAll(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('MENTOR', 'ADMIN')
  @ApiOperation({ summary: 'Delete availability slot' })
  @ApiResponse({ status: 200, description: 'Availability slot deleted.' })
  @ApiResponse({ status: 404, description: 'Availability slot not found.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.availabilityService.remove(id, req.user.userId);
  }
}