import { apiClient } from './client'
import { User, UserCreateRequest, UserUpdateRequest, UserBalanceAdjustment, UserPasswordReset } from '@/types'

export const usersService = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/api/v1/users/')
  },

  async getById(id: number): Promise<User> {
    return apiClient.get<User>(`/api/v1/users/${id}`)
  },

  async create(data: UserCreateRequest): Promise<User> {
    return apiClient.post<User>('/api/v1/users/', data)
  },

  async update(id: number, data: UserUpdateRequest): Promise<User> {
    return apiClient.put<User>(`/api/v1/users/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/v1/users/${id}`)
  },

  async adjustBalance(id: number, data: UserBalanceAdjustment): Promise<User> {
    return apiClient.post<User>(`/api/v1/users/${id}/adjust-balance`, data)
  },

  async resetPassword(id: number, data: UserPasswordReset): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/api/v1/users/${id}/reset-password`, data)
  },
}
