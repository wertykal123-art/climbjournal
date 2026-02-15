import apiClient from './client'
import { Climb, FriendClimb } from '@/types/models'
import { CreateClimbRequest, UpdateClimbRequest, ClimbFilters, PaginatedResponse } from '@/types/api'

export const climbsApi = {
  async getAll(filters?: ClimbFilters): Promise<PaginatedResponse<Climb>> {
    const params = new URLSearchParams()
    if (filters?.routeId) params.append('routeId', filters.routeId)
    if (filters?.locationId) params.append('locationId', filters.locationId)
    if (filters?.climbType) params.append('climbType', filters.climbType)
    if (filters?.from) params.append('from', filters.from)
    if (filters?.to) params.append('to', filters.to)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get<PaginatedResponse<Climb>>(`/climbs?${params}`)
    return response.data
  },

  async getById(id: string): Promise<Climb> {
    const response = await apiClient.get<Climb>(`/climbs/${id}`)
    return response.data
  },

  async getByRoute(routeId: string): Promise<Climb[]> {
    const response = await apiClient.get<Climb[]>(`/routes/${routeId}/climbs`)
    return response.data
  },

  async create(data: CreateClimbRequest): Promise<Climb> {
    const response = await apiClient.post<Climb>('/climbs', data)
    return response.data
  },

  async update(id: string, data: UpdateClimbRequest): Promise<Climb> {
    const response = await apiClient.put<Climb>(`/climbs/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/climbs/${id}`)
  },

  async getFriendClimbs(filters?: ClimbFilters & { userId?: string }): Promise<PaginatedResponse<FriendClimb>> {
    const params = new URLSearchParams()
    if (filters?.climbType) params.append('climbType', filters.climbType)
    if (filters?.from) params.append('from', filters.from)
    if (filters?.to) params.append('to', filters.to)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const path = filters?.userId ? `/climbs/friends/${filters.userId}` : '/climbs/friends'
    const response = await apiClient.get<PaginatedResponse<FriendClimb>>(`${path}?${params}`)
    return response.data
  },
}
