import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).optional(),
  expertise: z.array(z.string()).optional(),
  availability: z.array(z.string()).optional(),
})

export const mentorshipRequestSchema = z.object({
  mentorId: z.string(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const sessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  scheduledAt: z.string().or(z.date()),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration must be less than 3 hours'),
  meetingLink: z.string().url('Invalid meeting link').optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type MentorshipRequestFormData = z.infer<typeof mentorshipRequestSchema>
export type SessionFormData = z.infer<typeof sessionSchema>