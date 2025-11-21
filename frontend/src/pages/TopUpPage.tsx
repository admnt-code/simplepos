import React, { useState } from 'react'
import { useAuth } from '@/hooks'
import { Card, Input, Button } from '@/components/ui'
import { Wallet, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionsService } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export const TopUpPage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const quickAmounts = [5, 10, 20, 50]

  const handleTopUp = async (topUpAmount: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await transactionsService.topUp({
        amount: topUpAmount,
        payment_method: 'cloud_api',
      })
      
      toast.success(`${formatCurrency(topUpAmount)} erfolgreich aufgeladen!`)
      
      // Update user balance
      updateUser({ ...user, balance: user.balance + topUpAmount })
      setAmount('')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Fehler beim Aufladen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guthaben aufladen</h1>
        <p className="text-gray-600 mt-2">
          Lade dein Guthaben über SumUp auf
        </p>
      </div>

      {/* Aktuelles Guthaben */}
      <Card>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Aktuelles Guthaben</p>
          <p className="text-4xl font-bold text-primary-600">
            {formatCurrency(user?.balance || 0)}
          </p>
        </div>
      </Card>

      {/* Quick Amounts */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Schnellauswahl
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="secondary"
              size="lg"
              onClick={() => handleTopUp(quickAmount)}
              loading={loading}
              className="h-20 text-xl"
            >
              {formatCurrency(quickAmount)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Custom Amount */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Eigener Betrag
        </h2>
        <div className="space-y-4">
          <Input
            label="Betrag (€)"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.00"
          />
          <Button
            variant="success"
            fullWidth
            icon={CreditCard}
            onClick={() => handleTopUp(parseFloat(amount))}
            disabled={!amount || parseFloat(amount) <= 0}
            loading={loading}
          >
            Mit SumUp bezahlen
          </Button>
        </div>
      </Card>
    </div>
  )
}
