import apiClient from './client'
import { Location } from '@/types/models'
import { CreateLocationRequest, UpdateLocationRequest } from '@/types/api'

export const locationsApi = {
  async getAll(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/locations')
    return response.data
  },

  async getById(id: string): Promise<Location> {
    const response = await apiClient.get<Location>(`/locations/${id}`)
    return response.data
  },

  async create(data: CreateLocationRequest): Promise<Location> {
    const response = await apiClient.post<Location>('/locations', data)
    return response.data
  },

  async update(id: string, data: UpdateLocationRequest): Promise<Location> {
    const response = await apiClient.put<Location>(`/locations/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/locations/${id}`)
  },
}
