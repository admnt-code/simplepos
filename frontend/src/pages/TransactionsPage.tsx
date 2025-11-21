import React from 'react'
import { useUserTransactions } from '@/hooks'
import { Card, Badge, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'

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
        <h1 className="text-3xl font-bold text-gray-900">Transaktionen</h1>
        <p className="text-gray-600 mt-2">
          Übersicht über alle Transaktionen
        </p>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDateTime(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info" size="sm">
                      {transaction.transaction_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        transaction.status === 'successful'
                          ? 'success'
                          : transaction.status === 'failed'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
