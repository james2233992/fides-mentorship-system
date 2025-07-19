import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        bio: true,
        expertise: true,
        linkedinUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        bio: true,
        expertise: true,
        linkedinUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        bio: true,
        expertise: true,
        linkedinUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async findMentors(page: number = 1, limit: number = 10, expertise?: string) {
    const where: any = {
      role: { in: [UserRole.MENTOR, UserRole.ADMIN] },
      isActive: true,
    };

    if (expertise) {
      where.expertise = {
        contains: expertise,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;

    const [mentors, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          expertise: true,
          profilePicture: true,
          linkedinUrl: true,
          _count: {
            select: {
              mentorSessions: {
                where: {
                  status: 'COMPLETED',
                },
              },
            },
          },
          mentorSessions: {
            where: {
              feedback: {
                isNot: null,
              },
            },
            select: {
              feedback: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.user.count({ where }),
    ]);

    // Transform the response to include additional fields
    const transformedMentors = mentors.map(mentor => {
      // Calculate average rating
      const ratings = mentor.mentorSessions
        .filter(session => session.feedback?.rating)
        .map(session => session.feedback!.rating);
      
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      return {
        id: mentor.id,
        email: mentor.email,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        bio: mentor.bio,
        expertise: mentor.expertise,
        profilePicture: mentor.profilePicture,
        linkedinUrl: mentor.linkedinUrl,
        totalSessions: mentor._count.mentorSessions,
        isAvailable: true, // This could be calculated based on availability settings
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        totalRatings: ratings.length,
      };
    });

    return {
      data: transformedMentors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            menteeSessions: true,
            mentorSessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get session statistics
    const sessionStats = await this.prisma.mentorshipSession.groupBy({
      by: ['status'],
      where: {
        OR: [
          { menteeId: userId },
          { mentorId: userId },
        ],
      },
      _count: true,
    });

    const stats = {
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      totalHours: 0,
    };

    sessionStats.forEach(stat => {
      stats.totalSessions += stat._count;
      if (stat.status === 'COMPLETED') {
        stats.completedSessions = stat._count;
      } else if (stat.status === 'SCHEDULED') {
        stats.upcomingSessions = stat._count;
      }
    });

    // Calculate total hours from completed sessions
    const completedSessions = await this.prisma.mentorshipSession.findMany({
      where: {
        OR: [
          { menteeId: userId },
          { mentorId: userId },
        ],
        status: 'COMPLETED',
      },
      select: {
        duration: true,
      },
    });

    stats.totalHours = completedSessions.reduce((total, session) => {
      return total + (session.duration / 60);
    }, 0);

    return stats;
  }
}