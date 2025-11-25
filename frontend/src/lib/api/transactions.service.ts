import { apiClient } from './client'
import { Transaction, TransactionFormData, TopUpRequest } from '@/types'
import axios from 'axios'

export const transactionsService = {
  async getAllTransactions(userType: 'all' | 'members' | 'guests' = 'all'): Promise<Transaction[]> {
    const params = new URLSearchParams()
    params.append('user_type', userType)
    return apiClient.get<Transaction[]>(`/api/v1/transactions/?${params.toString()}`)
  },

  async getMyTransactions(): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/api/v1/transactions/my')
  },

  async getAll(): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/api/v1/transactions/')
  },

  async getById(id: number): Promise<Transaction> {
    return apiClient.get<Transaction>(`/api/v1/transactions/${id}`)
  },

  async getUserTransactions(userId?: number): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/api/v1/transactions/my')
  },

  async create(data: TransactionFormData): Promise<Transaction> {
    return apiClient.post<Transaction>('/api/v1/transactions/', data)
  },

  async topUp(data: TopUpRequest): Promise<Transaction> {
    return apiClient.post<Transaction>('/api/v1/sumup/top-up', data)
  },
  
async exportPDF(userType: 'all' | 'members' | 'guests' = 'all'): Promise<ArrayBuffer> {
    const token = localStorage.getItem('access_token')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    const response = await axios.get(`${API_URL}/api/v1/transactions/export/pdf`, {
      params: { user_type: userType },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'arraybuffer',
    })
    
    return response.data
  },
}
