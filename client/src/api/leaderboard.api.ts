import apiClient from './client'
import { LeaderboardEntry } from '@/types/models'
import { LeaderboardParams } from '@/types/api'

export const leaderboardApi = {
  async getGlobal(params?: LeaderboardParams): Promise<LeaderboardEntry[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const response = await apiClient.get<LeaderboardEntry[]>(`/leaderboard/global?${queryParams}`)
    return response.data
  },

  async getMonthly(params?: LeaderboardParams): Promise<LeaderboardEntry[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const response = await apiClient.get<LeaderboardEntry[]>(`/leaderboard/monthly?${queryParams}`)
    return response.data
  },

  async getWeekly(params?: LeaderboardParams): Promise<LeaderboardEntry[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const response = await apiClient.get<LeaderboardEntry[]>(`/leaderboard/weekly?${queryParams}`)
    return response.data
  },

  async getUserRank(userId: string): Promise<{ global: number; monthly: number; weekly: number }> {
    const response = await apiClient.get<{ global: number; monthly: number; weekly: number }>(
      `/leaderboard/user/${userId}`
    )
    return response.data
  },
}
