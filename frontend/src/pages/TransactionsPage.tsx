import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks'
import { Card, LoadingSpinner, Button } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ShoppingBag, Users, Filter, Download } from 'lucide-react'
import { transactionsService } from '@/lib/api'
import toast from 'react-hot-toast'

export const TransactionsPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [showAllTransactions, setShowAllTransactions] = useState(isAdmin ? true : false)
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'members' | 'guests'>('all')

  // User's own transactions
  const { data: userTransactions, isLoading: userLoading } = useQuery({
    queryKey: ['transactions', 'my'],
    queryFn: () => transactionsService.getMyTransactions(),
    enabled: !!user && !showAllTransactions,
  })

  // All transactions (Admin only)
  const { data: allTransactions, isLoading: allLoading } = useQuery({
    queryKey: ['transactions', 'all', userTypeFilter],
    queryFn: () => transactionsService.getAllTransactions(userTypeFilter),
    enabled: isAdmin && showAllTransactions,
  })

  const transactions = showAllTransactions ? allTransactions : userTransactions
  const isLoading = showAllTransactions ? allLoading : userLoading

  const handleExportPDF = async () => {
    if (!allTransactions || allTransactions.length === 0) {
      toast.error('Keine Transaktionen zum Exportieren vorhanden')
      return
    }

    try {
      const response = await transactionsService.exportPDF(userTypeFilter)

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transaktionen_${userTypeFilter}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF erfolgreich exportiert!')
    } catch (error: any) {
      toast.error('Fehler beim PDF-Export')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Kauf',
      top_up: 'Aufladung',
      transfer: 'Transfer',
      admin_adjustment: 'Admin-Anpassung',
    }
    return labels[type] || type
  }

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return ''
    const labels: Record<string, string> = {
      cash: 'Bar',
      cloud_api: 'SumUp',
      payment_link: 'SumUp Link',
      balance: 'Guthaben',
      transfer: 'Transfer',
    }
    return labels[method] || method
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {showAllTransactions ? 'Alle Transaktionen' : 'Meine Käufe'}
          </h1>
          <p className="text-gray-600 mt-2">
            {showAllTransactions
              ? 'Übersicht über alle Transaktionen von Mitgliedern und Gästen'
              : 'Übersicht über alle deine Einkäufe'}
          </p>
        </div>

        {/* Admin Toggle */}
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant={!showAllTransactions ? 'primary' : 'ghost'}
              icon={ShoppingBag}
              onClick={() => setShowAllTransactions(false)}
            >
              Meine
            </Button>
            <Button
              variant={showAllTransactions ? 'primary' : 'ghost'}
              icon={Users}
              onClick={() => setShowAllTransactions(true)}
            >
              Alle
            </Button>
            {showAllTransactions && (
              <Button
                variant="ghost"
                icon={Download}
                onClick={handleExportPDF}
              >
                PDF Export
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter für "Alle Transaktionen" */}
      {isAdmin && showAllTransactions && (
        <Card>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtern nach:</span>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setUserTypeFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  userTypeFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setUserTypeFilter('members')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  userTypeFilter === 'members'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nur Mitglieder
              </button>
              <button
                onClick={() => setUserTypeFilter('guests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  userTypeFilter === 'guests'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nur Gäste
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <Card key={transaction.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="bg-primary-50 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">
                        {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                      </p>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </span>
                      {transaction.payment_method && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                          {getPaymentMethodLabel(transaction.payment_method)}
                        </span>
                      )}
                    </div>

                    {/* Show user/guest info for admin */}
                    {showAllTransactions && (
                      <p className="text-sm text-gray-600 mt-1">
                        {transaction.user_id ? (
                          <>Mitglied ID: {transaction.user_id}</>
                        ) : transaction.guest_id ? (
                          <>Gast ID: {transaction.guest_id}</>
                        ) : (
                          'System'
                        )}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(transaction.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      transaction.transaction_type === 'top_up' || 
                      (transaction.transaction_type === 'admin_adjustment' && transaction.amount > 0) ||
                      (transaction.transaction_type === 'transfer' && transaction.amount > 0)
                        ? 'text-success-600'
                        : 'text-danger-600'
                    }`}
                  >
                    {(transaction.transaction_type === 'top_up' || 
                      (transaction.transaction_type === 'admin_adjustment' && transaction.amount > 0) ||
                      (transaction.transaction_type === 'transfer' && transaction.amount > 0))
                      ? '+'
                      : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      transaction.status === 'successful'
                        ? 'bg-success-100 text-success-700'
                        : transaction.status === 'pending'
                        ? 'bg-warning-100 text-warning-700'
                        : 'bg-error-100 text-error-700'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
            </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {showAllTransactions ? 'Keine Transaktionen gefunden' : 'Noch keine Einkäufe'}
              </p>
           </div>
         </Card>
        )}
      </div>
    </div>
  )
}
