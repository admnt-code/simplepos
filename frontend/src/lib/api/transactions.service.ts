import { apiClient } from './client'
import { Transaction, TransactionFormData, TopUpRequest } from '@/types'

export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/api/v1/transactions/')
  },

  async getById(id: number): Promise<Transaction> {
    return apiClient.get<Transaction>(`/api/v1/transactions/${id}`)
  },

  async getUserTransactions(userId?: number): Promise<Transaction[]> {
  // Immer /my verwenden - zeigt Transaktionen des aktuellen Users
  return apiClient.get<Transaction[]>('/api/v1/transactions/my')
  },  

  async create(data: TransactionFormData): Promise<Transaction> {
    return apiClient.post<Transaction>('/api/v1/transactions/', data)
  },

  async topUp(data: TopUpRequest): Promise<Transaction> {
    return apiClient.post<Transaction>('/api/v1/sumup/top-up', data)
  },
}
