import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilitySlotDto, CreateAvailabilityBulkDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAvailabilityDto: CreateAvailabilitySlotDto) {
    // Validate time slot
    this.validateTimeSlot(createAvailabilityDto);

    return this.prisma.availability.create({
      data: {
        userId,
        ...createAvailabilityDto,
      },
    });
  }

  async createBulk(userId: string, createAvailabilityBulkDto: CreateAvailabilityBulkDto) {
    // Validate all time slots
    createAvailabilityBulkDto.slots.forEach(slot => this.validateTimeSlot(slot));

    // Check for overlapping slots
    const overlapping = this.checkOverlappingSlots(createAvailabilityBulkDto.slots);
    if (overlapping) {
      throw new BadRequestException('Time slots cannot overlap');
    }

    // Delete existing availability for user
    await this.prisma.availability.deleteMany({
      where: { userId },
    });

    // Create new availability slots
    const slots = await this.prisma.availability.createMany({
      data: createAvailabilityBulkDto.slots.map(slot => ({
        userId,
        ...slot,
      })),
    });

    return this.findAll(userId);
  }

  async findAll(userId: string) {
    return this.prisma.availability.findMany({
      where: { userId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findByMentor(mentorId: string) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || (mentor.role !== 'MENTOR' && mentor.role !== 'ADMIN')) {
      throw new NotFoundException('Mentor not found');
    }

    return this.prisma.availability.findMany({
      where: { userId: mentorId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async getAvailableSlots(mentorId: string, date: Date) {
    const dayOfWeek = date.getDay();
    
    // Get mentor's availability for the day
    const availability = await this.prisma.availability.findMany({
      where: {
        userId: mentorId,
        dayOfWeek,
        isRecurring: true,
      },
    });

    // Get existing sessions for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.mentorshipSession.findMany({
      where: {
        mentorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    // Calculate available slots
    const availableSlots: { time: string; available: boolean }[] = [];
    
    for (const slot of availability) {
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);
      
      // Generate 30-minute slots
      for (let time = slotStart; time < slotEnd; time += 30) {
        const timeString = this.minutesToTime(time);
        const slotDate = new Date(date);
        const [hours, minutes] = timeString.split(':').map(Number);
        slotDate.setHours(hours, minutes, 0, 0);

        // Check if slot is not occupied
        const isOccupied = sessions.some(session => {
          const sessionStart = new Date(session.scheduledAt);
          const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);
          return slotDate >= sessionStart && slotDate < sessionEnd;
        });

        if (!isOccupied && slotDate > new Date()) {
          availableSlots.push({
            time: timeString,
            available: true,
          });
        }
      }
    }

    return availableSlots;
  }

  async remove(id: string, userId: string) {
    const availability = await this.prisma.availability.findFirst({
      where: { id, userId },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    return this.prisma.availability.delete({
      where: { id },
    });
  }

  async removeAll(userId: string) {
    return this.prisma.availability.deleteMany({
      where: { userId },
    });
  }

  private validateTimeSlot(slot: CreateAvailabilitySlotDto) {
    const startMinutes = this.timeToMinutes(slot.startTime);
    const endMinutes = this.timeToMinutes(slot.endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (endMinutes - startMinutes < 30) {
      throw new BadRequestException('Time slot must be at least 30 minutes');
    }
  }

  private checkOverlappingSlots(slots: CreateAvailabilitySlotDto[]) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];

        if (slot1.dayOfWeek === slot2.dayOfWeek) {
          const start1 = this.timeToMinutes(slot1.startTime);
          const end1 = this.timeToMinutes(slot1.endTime);
          const start2 = this.timeToMinutes(slot2.startTime);
          const end2 = this.timeToMinutes(slot2.endTime);

          if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}