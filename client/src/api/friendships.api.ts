import apiClient from './client'
import { Friendship, Friend, UserSummary } from '@/types/models'
import { SendFriendRequestRequest, UpdateFriendRequestRequest } from '@/types/api'

export const friendshipsApi = {
  async searchUsers(query: string): Promise<UserSummary[]> {
    const response = await apiClient.get<UserSummary[]>('/friendships/search', {
      params: { query },
    })
    return response.data
  },

  async sendRequest(data: SendFriendRequestRequest): Promise<Friendship> {
    const response = await apiClient.post<Friendship>('/friendships/requests', data)
    return response.data
  },

  async getIncomingRequests(): Promise<Friendship[]> {
    const response = await apiClient.get<Friendship[]>('/friendships/requests/incoming')
    return response.data
  },

  async getOutgoingRequests(): Promise<Friendship[]> {
    const response = await apiClient.get<Friendship[]>('/friendships/requests/outgoing')
    return response.data
  },

  async updateRequest(id: string, data: UpdateFriendRequestRequest): Promise<Friendship | void> {
    if (data.action === 'reject') {
      await apiClient.put(`/friendships/requests/${id}`, data)
      return
    }
    const response = await apiClient.put<Friendship>(`/friendships/requests/${id}`, data)
    return response.data
  },

  async getFriends(): Promise<Friend[]> {
    const response = await apiClient.get<Friend[]>('/friendships')
    return response.data
  },

  async removeFriend(friendshipId: string): Promise<void> {
    await apiClient.delete(`/friendships/${friendshipId}`)
  },
}
