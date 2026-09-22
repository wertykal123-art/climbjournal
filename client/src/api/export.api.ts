import apiClient from './client'

export interface ExportData {
  user: {
    email: string
    username: string
    displayName: string
    profilePicture?: string | null
    preferredGradingSystem?: string
  }
  locations: Array<{
    name: string
    type: string
    address?: string | null
    country?: string | null
    description?: string | null
    isPublic?: boolean
    defaultGradingSystem?: string
  }>
  routes: Array<{
    locationName: string
    name: string
    difficultyFrench: string
    difficultyUIAA?: string | null
    heightMeters?: number | null
    protectionCount?: number | null
    visualId?: string | null
    setter?: string | null
    description?: string | null
    color?: string | null
    stoneType?: string | null
    isPublic?: boolean
    isActive?: boolean
  }>
  climbs: Array<{
    routeName: string
    locationName: string
    date: string
    climbType: string
    attemptCount: number
    personalRating?: number | null
    comments?: string | null
    // Informational in exports; the server recomputes points on import
    points?: number
  }>
  exportedAt: string
}

export const exportApi = {
  async exportData(): Promise<ExportData> {
    const response = await apiClient.get<ExportData>('/export/json')
    return response.data
  },

  async importData(data: ExportData): Promise<{ message: string; imported: { locations: number; routes: number; climbs: number } }> {
    const response = await apiClient.post<{ message: string; imported: { locations: number; routes: number; climbs: number } }>('/import/json', data)
    return response.data
  },

  downloadAsFile(data: ExportData, filename: string = 'climbing-journal-export.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
