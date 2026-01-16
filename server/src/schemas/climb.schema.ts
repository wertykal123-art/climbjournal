import { z } from 'zod'

const climbTypes = ['OS', 'FLASH', 'RP', 'PP', 'TOPROPE', 'AUTOBELAY', 'TRY'] as const

export const createClimbSchema = z.object({
  routeId: z.string().uuid('Invalid route ID'),
  date: z.string().datetime({ message: 'Invalid date format' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  climbType: z.enum(climbTypes, {
    errorMap: () => ({ message: 'Invalid climb type' }),
  }),
  attemptCount: z.number().int().positive().default(1),
  personalRating: z.number().int().min(1).max(5).optional(),
  comments: z.string().max(2000).optional(),
})

export const updateClimbSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  climbType: z.enum(climbTypes).optional(),
  attemptCount: z.number().int().positive().optional(),
  personalRating: z.number().int().min(1).max(5).optional().nullable(),
  comments: z.string().max(2000).optional().nullable(),
})

export const climbFiltersSchema = z.object({
  routeId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  climbType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreateClimbInput = z.infer<typeof createClimbSchema>
export type UpdateClimbInput = z.infer<typeof updateClimbSchema>
export type ClimbFilters = z.infer<typeof climbFiltersSchema>
