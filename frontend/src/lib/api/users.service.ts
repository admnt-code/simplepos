import { apiClient } from './client'
import { User, UserFormData } from '@/types'

export const usersService = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/api/v1/users/')
  },

  async getById(id: number): Promise<User> {
    return apiClient.get<User>(`/api/v1/users/${id}`)
  },

  async create(data: UserFormData): Promise<User> {
    return apiClient.post<User>('/api/v1/users/', data)
  },

  async update(id: number, data: Partial<UserFormData>): Promise<User> {
    return apiClient.put<User>(`/api/v1/users/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/v1/users/${id}`)
  },

  async updateBalance(id: number, amount: number, description?: string): Promise<User> {
    return apiClient.post<User>(`/api/v1/users/${id}/adjust-balance`, {
      amount,
      description,
    })
  },

  async linkRFID(id: number, rfidToken: string): Promise<User> {
    return apiClient.post<User>(`/api/v1/users/${id}/link-rfid`, {
      rfid_token: rfidToken,
    })
  },
}
