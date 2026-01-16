import apiClient from './client'
import {
  OverviewStats,
  TimelineData,
  GradeDistribution,
  ClimbTypeDistribution,
} from '@/types/models'
import { TimelineParams } from '@/types/api'

export const statsApi = {
  async getOverview(): Promise<OverviewStats> {
    const response = await apiClient.get<OverviewStats>('/stats/overview')
    return response.data
  },

  async getTimeline(params?: TimelineParams): Promise<TimelineData[]> {
    const queryParams = new URLSearchParams()
    if (params?.period) queryParams.append('period', params.period)
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy)

    const response = await apiClient.get<TimelineData[]>(`/stats/timeline?${queryParams}`)
    return response.data
  },

  async getGradeDistribution(): Promise<GradeDistribution[]> {
    const response = await apiClient.get<GradeDistribution[]>('/stats/distribution')
    return response.data
  },

  async getClimbTypeDistribution(): Promise<ClimbTypeDistribution[]> {
    const response = await apiClient.get<ClimbTypeDistribution[]>('/stats/types')
    return response.data
  },

  async getPyramid(): Promise<GradeDistribution[]> {
    const response = await apiClient.get<GradeDistribution[]>('/stats/pyramid')
    return response.data
  },

  async getProgression(): Promise<{ date: string; hardestGrade: string }[]> {
    const response = await apiClient.get<{ date: string; hardestGrade: string }[]>('/stats/progression')
    return response.data
  },
}
