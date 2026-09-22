import { z } from 'zod'
import { FRENCH_GRADES } from '../utils/grades.js'
import { CLIMB_TYPES } from './climb.schema.js'
import { STONE_TYPES, hexColorRegex } from './route.schema.js'

const importLocationSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['GYM', 'CRAG']),
  address: z.string().max(500).nullish(),
  country: z.string().max(100).nullish(),
  description: z.string().max(2000).nullish(),
  isPublic: z.boolean().default(false),
  defaultGradingSystem: z.enum(['FRENCH', 'UIAA']).default('FRENCH'),
})

const importRouteSchema = z.object({
  locationName: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  difficultyFrench: z.enum(FRENCH_GRADES as unknown as [string, ...string[]]),
  difficultyUIAA: z.string().max(10).nullish(),
  heightMeters: z.number().positive().nullish(),
  protectionCount: z.number().int().positive().nullish(),
  visualId: z.string().max(50).nullish(),
  setter: z.string().max(100).nullish(),
  description: z.string().max(2000).nullish(),
  color: z.string().regex(hexColorRegex).nullish(),
  stoneType: z.enum(STONE_TYPES).nullish(),
  isPublic: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

// `points` is deliberately absent: it is always recomputed server-side from
// the route grade and climb type so an edited backup can't forge scores.
const importClimbSchema = z.object({
  routeName: z.string().min(1).max(200),
  locationName: z.string().min(1).max(200),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  climbType: z.enum(CLIMB_TYPES),
  attemptCount: z.number().int().positive().default(1),
  personalRating: z.number().int().min(1).max(5).nullish(),
  comments: z.string().max(2000).nullish(),
})

export const importDataSchema = z.object({
  locations: z.array(importLocationSchema).max(10000),
  routes: z.array(importRouteSchema).max(50000),
  climbs: z.array(importClimbSchema).max(100000),
})

export type ImportDataInput = z.infer<typeof importDataSchema>
