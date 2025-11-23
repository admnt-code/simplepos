import React from 'react'
import { useUserTransactions, useAuth } from '@/hooks'
import { Card, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth()
  const { data: transactions, isLoading } = useUserTransactions(user?.id)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meine Käufe</h1>
        <p className="text-gray-600 mt-2">
          Übersicht über alle deine Einkäufe
        </p>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <Card key={transaction.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary-50 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'Einkauf'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-danger-600">
                    -{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Noch keine Einkäufe</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
