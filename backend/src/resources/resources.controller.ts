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
  Request,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  create(@Body() createResourceDto: CreateResourceDto, @Request() req) {
    return this.resourcesService.create(createResourceDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    const filters = {
      category,
      type,
      search,
      tags: tags ? tags.split(',') : undefined,
      sessionId,
    };

    return this.resourcesService.findAll(
      req.user.userId,
      req.user.role as UserRole,
      filters,
    );
  }

  @Get('categories')
  getCategories() {
    return this.resourcesService.getCategories();
  }

  @Get('tags/popular')
  getPopularTags() {
    return this.resourcesService.getPopularTags();
  }

  @Get('my-resources')
  getMyResources(@Request() req) {
    return this.resourcesService.getMyResources(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.resourcesService.findOne(
      id,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    @Request() req,
  ) {
    return this.resourcesService.update(
      id,
      updateResourceDto,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.resourcesService.remove(
      id,
      req.user.userId,
      req.user.role as UserRole,
    );
  }
}