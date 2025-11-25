import { apiClient } from './client'
import { Guest, GuestFormData, GuestCloseTabRequest } from '@/types'

export const guestsService = {
  async getAll(activeOnly = true): Promise<Guest[]> {
    const params = new URLSearchParams()
    params.append('active_only', activeOnly.toString())
    
    return apiClient.get<Guest[]>(`/api/v1/guests/?${params.toString()}`)
  },

  async getById(id: number): Promise<Guest> {
    return apiClient.get<Guest>(`/api/v1/guests/${id}`)
  },

  async create(data: GuestFormData): Promise<Guest> {
    return apiClient.post<Guest>('/api/v1/guests/', data)
  },

  async update(id: number, data: Partial<GuestFormData>): Promise<Guest> {
    return apiClient.put<Guest>(`/api/v1/guests/${id}`, data)
  },

  async addItemToTab(guestId: number, productId: number, quantity: number): Promise<{ message: string; total: number }> {
    return apiClient.post(`/api/v1/guests/${guestId}/add-item`, null, {
      params: { product_id: productId, quantity }
    })
  },

  async closeTab(id: number, data: GuestCloseTabRequest): Promise<{ message: string; transaction_id: number; total: number; payment_method: string }> {
    return apiClient.post(`/api/v1/guests/${id}/close-tab`, data)
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/v1/guests/${id}`)
  },
}
