import { z } from 'zod'

export const ticketFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'maintenance',
    'cleaning',
    'noise',
    'billing',
    'access',
    'other',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
})

export type TicketFormValues = z.infer<typeof ticketFormSchema>
