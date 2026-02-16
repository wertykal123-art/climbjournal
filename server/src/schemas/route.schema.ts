import { z } from 'zod'
import { FRENCH_GRADES } from '../utils/grades.js'

const STONE_TYPES = [
  'GRANITE',
  'LIMESTONE',
  'SANDSTONE',
  'GNEISS',
  'BASALT',
  'CONGLOMERATE',
  'QUARTZITE',
  'SLATE',
  'SCHIST',
  'TUFF',
  'OTHER',
] as const

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

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
  color: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
  stoneType: z.enum(STONE_TYPES).optional(),
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
  color: z.string().regex(hexColorRegex, 'Invalid hex color').optional().nullable(),
  stoneType: z.enum(STONE_TYPES).optional().nullable(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const routeFiltersSchema = z.object({
  locationId: z.string().uuid().optional(),
  minGrade: z.string().optional(),
  maxGrade: z.string().optional(),
  search: z.string().optional(),
  includeReset: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreateRouteInput = z.infer<typeof createRouteSchema>
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>
export type RouteFilters = z.infer<typeof routeFiltersSchema>
