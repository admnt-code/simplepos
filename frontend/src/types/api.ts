import { AxiosError } from 'axios'

export interface ApiError {
  detail?: string
  message?: string
  errors?: Record<string, string[]>
}

export type ApiErrorResponse = AxiosError<ApiError>

export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

export interface PaginationParams {
  page?: number
  page_size?: number
  skip?: number
  limit?: number
}

export interface SearchParams extends PaginationParams {
  q?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}
