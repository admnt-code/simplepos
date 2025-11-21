import { apiClient } from './client'
import { Product, ProductCategory, ProductFormData } from '@/types'

export const productsService = {
  async getAll(category?: ProductCategory, availableOnly = true): Promise<Product[]> {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (availableOnly) params.append('available_only', 'true')
    return apiClient.get<Product[]>(`/api/v1/products/?${params.toString()}`)
  },

  async getById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/api/v1/products/${id}`)
  },

  async create(data: ProductFormData): Promise<Product> {
    return apiClient.post<Product>('/api/v1/products/', data)
  },

  async update(id: number, data: Partial<ProductFormData>): Promise<Product> {
    return apiClient.put<Product>(`/api/v1/products/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/api/v1/products/${id}`)
  },

  async toggleAvailability(id: number): Promise<Product> {
    return apiClient.patch<Product>(`/api/v1/products/${id}/toggle-availability`)
  },
}
