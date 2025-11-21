import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/lib/api'
import { TopUpRequest, TransactionFormData } from '@/types'
import toast from 'react-hot-toast'

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsService.getAll(),
  })
}

export const useUserTransactions = (userId?: number) => {
  return useQuery({
    queryKey: ['transactions', 'user', userId],
    queryFn: () => transactionsService.getUserTransactions(userId),
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransactionFormData) => transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaktion erstellt')
    },
    onError: () => {
      toast.error('Fehler bei der Transaktion')
    },
  })
}

export const useTopUp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TopUpRequest) => transactionsService.topUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Guthaben aufgeladen')
    },
    onError: () => {
      toast.error('Fehler beim Aufladen')
    },
  })
}
