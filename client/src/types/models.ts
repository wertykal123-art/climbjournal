export type LocationType = 'GYM' | 'CRAG'

export type ClimbType = 'OS' | 'FLASH' | 'RP' | 'PP' | 'TOPROPE' | 'AUTOBELAY' | 'TRY'

export type FriendshipStatus = 'PENDING' | 'ACCEPTED'

export type GradingSystem = 'FRENCH' | 'UIAA'

export type UserGradingPreference = 'FRENCH' | 'UIAA' | 'LOCATION_DEFAULT'

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  profilePicture?: string
  preferredGradingSystem?: UserGradingPreference
  createdAt: string
  updatedAt: string
}

export interface UserSummary {
  id: string
  username: string
  displayName: string
  profilePicture?: string
}

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: string
  updatedAt: string
  requester?: UserSummary
  addressee?: UserSummary
}

export interface Friend extends UserSummary {
  friendshipId: string
}

export interface Location {
  id: string
  userId: string
  name: string
  type: LocationType
  address?: string
  country?: string
  description?: string
  isPublic?: boolean
  defaultGradingSystem?: GradingSystem
  createdAt: string
  updatedAt: string
  routeCount?: number
  user?: UserSummary
}

export interface Route {
  id: string
  userId: string
  locationId: string
  name: string
  heightMeters?: number
  protectionCount?: number
  visualId?: string
  difficultyUIAA?: string
  difficultyFrench: string
  setter?: string
  description?: string
  isPublic?: boolean
  createdAt: string
  updatedAt: string
  location?: Location
  climbCount?: number
  user?: UserSummary
}

export interface Climb {
  id: string
  userId: string
  routeId: string
  date: string
  climbType: ClimbType
  attemptCount: number
  personalRating?: number
  comments?: string
  points: number
  createdAt: string
  updatedAt: string
  route?: Route
}

export interface OverviewStats {
  totalClimbs: number
  totalPoints: number
  totalRoutes: number
  totalLocations: number
  hardestGrade: string | null
  currentStreak: number
  bestStreak: number
  thisMonthClimbs: number
  thisMonthPoints: number
}

export interface TimelineData {
  date: string
  climbs: number
  points: number
}

export interface GradeDistribution {
  grade: string
  count: number
  points: number
}

export interface ClimbTypeDistribution {
  type: ClimbType
  count: number
  percentage: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  profilePicture?: string
  totalPoints: number
  totalClimbs: number
  hardestGrade?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}
