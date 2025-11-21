import { apiClient } from './client'
import {
  User,
  LoginRequest,
  RFIDLoginRequest,
  AuthTokens,
} from '@/types'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(
      '/api/v1/auth/login',
      credentials
    )
    this.saveTokens(response)
    return response
  },

  async loginRFID(data: RFIDLoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(
      '/api/v1/auth/rfid-login',
      data
    )
    this.saveTokens(response)
    return response
  },

  async logout(): Promise<void> {
    this.clearTokens()
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/v1/members/me')
  },

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthTokens>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    this.saveTokens(response)
    return response
  },

  saveTokens(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    apiClient.setAuthToken(tokens.access_token)
  },

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    apiClient.clearAuthToken()
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  },
}
