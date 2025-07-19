import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalStatus, GoalPriority } from '@prisma/client';

// Example of how to properly test the GoalsService with mocked dependencies
describe('GoalsService', () => {
  let service: GoalsService;
  let prismaService: PrismaService;

  // Mock data
  const mockGoal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Learn NestJS',
    description: 'Master NestJS framework',
    category: 'Technical',
    targetDate: new Date('2025-12-31'),
    status: GoalStatus.IN_PROGRESS,
    priority: GoalPriority.HIGH,
    userId: 'user-123',
    mentorId: 'mentor-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    goal: {
      create: jest.fn().mockResolvedValue(mockGoal),
      findMany: jest.fn().mockResolvedValue([mockGoal]),
      findUnique: jest.fn().mockResolvedValue(mockGoal),
      update: jest.fn().mockResolvedValue(mockGoal),
      delete: jest.fn().mockResolvedValue(mockGoal),
      count: jest.fn().mockResolvedValue(1),
    },
    milestone: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
    goalProgress: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a goal', async () => {
      const createGoalDto: CreateGoalDto = {
        title: 'Learn NestJS',
        description: 'Master NestJS framework',
        category: 'Technical',
        targetDate: '2025-12-31',
        priority: GoalPriority.HIGH,
        mentorId: 'mentor-123',
      };

      const userId = 'user-123';
      const result = await service.create(createGoalDto, userId);

      expect(result).toEqual(mockGoal);
      expect(prismaService.goal.create).toHaveBeenCalledWith({
        data: {
          ...createGoalDto,
          userId,
          targetDate: new Date(createGoalDto.targetDate),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all goals for a user', async () => {
      const userId = 'user-123';
      const result = await service.findAll(userId);

      expect(result).toEqual([mockGoal]);
      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          milestones: {
            orderBy: { order: 'asc' },
          },
          progress: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              milestones: true,
              progress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter goals by status', async () => {
      const userId = 'user-123';
      const status = GoalStatus.IN_PROGRESS;
      
      await service.findAll(userId, { status });

      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: { 
          userId,
          status,
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('should update a goal', async () => {
      const goalId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      const updateData = {
        title: 'Updated Goal Title',
        status: GoalStatus.COMPLETED,
      };

      const result = await service.update(goalId, updateData, userId);

      expect(result).toEqual(mockGoal);
      expect(prismaService.goal.update).toHaveBeenCalledWith({
        where: { 
          id: goalId,
          userId,
        },
        data: updateData,
      });
    });
  });

  describe('remove', () => {
    it('should delete a goal', async () => {
      const goalId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';

      await service.remove(goalId, userId);

      expect(prismaService.goal.delete).toHaveBeenCalledWith({
        where: { 
          id: goalId,
          userId,
        },
      });
    });
  });
});