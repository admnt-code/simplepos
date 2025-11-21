import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService } from '@/lib/api'
import { ProductCategory, Product, ProductFormData } from '@/types'
import toast from 'react-hot-toast'

export const useProducts = (
  category?: ProductCategory,
  availableOnly = true
) => {
  return useQuery({
    queryKey: ['products', category, availableOnly],
    queryFn: () => productsService.getAll(category, availableOnly),
  })
}

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProductFormData) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produkt erstellt')
    },
    onError: () => {
      toast.error('Fehler beim Erstellen')
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produkt aktualisiert')
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren')
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produkt gelöscht')
    },
    onError: () => {
      toast.error('Fehler beim Löschen')
    },
  })
}
