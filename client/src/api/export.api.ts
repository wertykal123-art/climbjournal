import apiClient from './client'

export interface ExportData {
  user: {
    email: string
    username: string
    displayName: string
    profilePicture?: string
  }
  locations: Array<{
    name: string
    type: string
    address?: string
    country?: string
    description?: string
  }>
  routes: Array<{
    locationName: string
    name: string
    difficultyFrench: string
    difficultyUIAA?: string
    heightMeters?: number
    protectionCount?: number
    visualId?: string
    setter?: string
    description?: string
  }>
  climbs: Array<{
    routeName: string
    locationName: string
    date: string
    climbType: string
    attemptCount: number
    personalRating?: number
    comments?: string
    points: number
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
