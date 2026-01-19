import { z } from 'zod'

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  type: z.enum(['GYM', 'CRAG'], { errorMap: () => ({ message: 'Type must be GYM or CRAG' }) }),
  address: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
})

export const updateLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['GYM', 'CRAG']).optional(),
  address: z.string().max(500).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  isPublic: z.boolean().optional(),
})

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
