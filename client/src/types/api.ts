export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  displayName: string
  password: string
}

export interface CreateLocationRequest {
  name: string
  type: 'GYM' | 'CRAG'
  address?: string
  country?: string
  description?: string
}

export interface UpdateLocationRequest {
  name?: string
  type?: 'GYM' | 'CRAG'
  address?: string
  country?: string
  description?: string
}

export interface CreateRouteRequest {
  locationId: string
  name: string
  difficultyFrench: string
  difficultyUIAA?: string
  heightMeters?: number
  protectionCount?: number
  visualId?: string
  setter?: string
  description?: string
}

export interface UpdateRouteRequest {
  name?: string
  difficultyFrench?: string
  difficultyUIAA?: string
  heightMeters?: number
  protectionCount?: number
  visualId?: string
  setter?: string
  description?: string
}

export interface CreateClimbRequest {
  routeId: string
  date: string
  climbType: 'OS' | 'FLASH' | 'RP' | 'PP' | 'TOPROPE' | 'AUTOBELAY' | 'TRY'
  attemptCount?: number
  personalRating?: number
  comments?: string
}

export interface UpdateClimbRequest {
  date?: string
  climbType?: 'OS' | 'FLASH' | 'RP' | 'PP' | 'TOPROPE' | 'AUTOBELAY' | 'TRY'
  attemptCount?: number
  personalRating?: number
  comments?: string
}

export interface ClimbFilters {
  routeId?: string
  locationId?: string
  climbType?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface RouteFilters {
  locationId?: string
  minGrade?: string
  maxGrade?: string
  search?: string
  page?: number
  limit?: number
}

export interface TimelineParams {
  period?: 'week' | 'month' | 'year' | 'all'
  groupBy?: 'day' | 'week' | 'month'
}

export interface LeaderboardParams {
  period?: 'all' | 'monthly' | 'weekly'
  limit?: number
  offset?: number
}
