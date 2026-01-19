import { z } from 'zod'
import { FRENCH_GRADES } from '../utils/grades.js'

export const createRouteSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  difficultyFrench: z.enum(FRENCH_GRADES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid French grade' }),
  }),
  difficultyUIAA: z.string().max(10).optional(),
  heightMeters: z.number().positive().optional(),
  protectionCount: z.number().int().positive().optional(),
  visualId: z.string().max(50).optional(),
  setter: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
})

export const updateRouteSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  difficultyFrench: z.enum(FRENCH_GRADES as unknown as [string, ...string[]]).optional(),
  difficultyUIAA: z.string().max(10).optional().nullable(),
  heightMeters: z.number().positive().optional().nullable(),
  protectionCount: z.number().int().positive().optional().nullable(),
  visualId: z.string().max(50).optional().nullable(),
  setter: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  isPublic: z.boolean().optional(),
})

export const routeFiltersSchema = z.object({
  locationId: z.string().uuid().optional(),
  minGrade: z.string().optional(),
  maxGrade: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreateRouteInput = z.infer<typeof createRouteSchema>
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>
export type RouteFilters = z.infer<typeof routeFiltersSchema>
