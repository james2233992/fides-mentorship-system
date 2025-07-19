import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto, authorId: string) {
    // Verify session ownership if sessionId is provided
    if (createResourceDto.sessionId) {
      const session = await this.prisma.mentorshipSession.findUnique({
        where: { id: createResourceDto.sessionId },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (session.mentorId !== authorId) {
        throw new ForbiddenException('You can only add resources to your own sessions');
      }
    }

    return this.prisma.resource.create({
      data: {
        ...createResourceDto,
        authorId,
        tags: createResourceDto.tags || [],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            mentorId: true,
            menteeId: true,
          },
        },
      },
    });
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    filters?: {
      category?: string;
      type?: string;
      search?: string;
      tags?: string[];
      sessionId?: string;
    },
  ) {
    const where: Prisma.ResourceWhereInput = {
      OR: [
        { isPublic: true },
        { authorId: userId },
        {
          session: {
            OR: [
              { mentorId: userId },
              { menteeId: userId },
            ],
          },
        },
      ],
    };

    if (filters) {
      if (filters.category) {
        where.category = filters.category;
      }
      if (filters.type) {
        where.type = filters.type as any;
      }
      if (filters.sessionId) {
        where.sessionId = filters.sessionId;
      }
      if (filters.search) {
        where.AND = [
          {
            OR: [
              { title: { contains: filters.search } },
              { description: { contains: filters.search } },
            ],
          },
        ];
      }
    }

    const resources = await this.prisma.resource.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by tags in application code since SQLite doesn't support JSON queries well
    if (filters?.tags && filters.tags.length > 0) {
      return resources.filter(resource => {
        const resourceTags = resource.tags as string[];
        return filters.tags!.some(tag => resourceTags.includes(tag));
      });
    }

    return resources;
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profilePicture: true,
          },
        },
        session: {
          include: {
            mentor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            mentee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Check access permissions
    const hasAccess = 
      resource.isPublic ||
      resource.authorId === userId ||
      (resource.session && (
        resource.session.mentorId === userId ||
        resource.session.menteeId === userId
      )) ||
      userRole === UserRole.ADMIN;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto, userId: string, userRole: UserRole) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Only author or admin can update
    if (resource.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own resources');
    }

    return this.prisma.resource.update({
      where: { id },
      data: {
        ...updateResourceDto,
        tags: updateResourceDto.tags !== undefined ? updateResourceDto.tags : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Only author or admin can delete
    if (resource.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own resources');
    }

    return this.prisma.resource.delete({
      where: { id },
    });
  }

  async getCategories() {
    const resources = await this.prisma.resource.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return resources.map(r => r.category);
  }

  async getPopularTags() {
    const resources = await this.prisma.resource.findMany({
      select: { tags: true },
    });

    const tagCounts = new Map<string, number>();
    
    resources.forEach(resource => {
      const tags = resource.tags as string[];
      tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Sort by count and return top 20
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));
  }

  async getMyResources(userId: string) {
    return this.prisma.resource.findMany({
      where: { authorId: userId },
      include: {
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}