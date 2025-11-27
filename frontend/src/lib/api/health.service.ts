import { apiClient } from './client'
import { HealthStatus } from '@/types'

export const healthService = {
  async getStatus(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/api/v1/health')
  },
}
