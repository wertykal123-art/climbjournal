import apiClient from './client'
import { Route } from '@/types/models'
import { CreateRouteRequest, UpdateRouteRequest, RouteFilters, PaginatedResponse } from '@/types/api'

export const routesApi = {
  async getAll(filters?: RouteFilters): Promise<PaginatedResponse<Route>> {
    const params = new URLSearchParams()
    if (filters?.locationId) params.append('locationId', filters.locationId)
    if (filters?.minGrade) params.append('minGrade', filters.minGrade)
    if (filters?.maxGrade) params.append('maxGrade', filters.maxGrade)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.includeReset) params.append('includeReset', 'true')
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get<PaginatedResponse<Route>>(`/routes?${params}`)
    return response.data
  },

  async getById(id: string): Promise<Route> {
    const response = await apiClient.get<Route>(`/routes/${id}`)
    return response.data
  },

  async getByLocation(locationId: string): Promise<Route[]> {
    const response = await apiClient.get<Route[]>(`/locations/${locationId}/routes`)
    return response.data
  },

  async create(data: CreateRouteRequest): Promise<Route> {
    const response = await apiClient.post<Route>('/routes', data)
    return response.data
  },

  async update(id: string, data: UpdateRouteRequest): Promise<Route> {
    const response = await apiClient.put<Route>(`/routes/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/routes/${id}`)
  },
}
