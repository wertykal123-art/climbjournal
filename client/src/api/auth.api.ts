import apiClient from './client'
import { User, AuthResponse } from '@/types/models'
import { LoginRequest, RegisterRequest } from '@/types/api'

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refresh(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh')
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  async updateProfile(data: Partial<Pick<User, 'displayName' | 'username' | 'profilePicture' | 'preferredGradingSystem'>>): Promise<User> {
    const response = await apiClient.put<User>('/users/profile', data)
    return response.data
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put('/users/password', data)
  },
}
