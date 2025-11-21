import React from 'react'
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react'
import { useCart, useAuth } from '@/hooks'
import { Card, Button, Badge } from '@/components/ui'
import { transactionsService } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { TransactionType, PaymentMethod } from '@/types';
import toast from 'react-hot-toast'

export const CartSummary: React.FC = () => {
  const { items, total, itemCount, clearCart, removeItem, updateQuantity } = useCart()
  const { user, updateUser } = useAuth()

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Warenkorb ist leer</p>
      </Card>
    )
  }

  const canAfford = user && user.balance >= total

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Warenkorb ({itemCount})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          onClick={clearCart}
        >
          Leeren
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.product.name}</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(item.product.member_price)} × {item.quantity}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.total_price)}
              </p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Zwischensumme</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Gesamt</span>
          <span className="text-primary-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Balance Info */}
      {user && (
        <div className="bg-primary-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">Aktuelles Guthaben</span>
            <span className="font-semibold">{formatCurrency(user.balance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Nach Kauf</span>
            <span className={canAfford ? 'text-success-600 font-semibold' : 'text-danger-600 font-semibold'}>
              {formatCurrency(user.balance - total)}
            </span>
          </div>
        </div>
      )}
        {/* Checkout Button */}
<Button
  variant="success"
  fullWidth
  icon={CreditCard}
  disabled={!canAfford}
  onClick={async () => {
    if (!user) return

    try {
      // Erstelle EINE Transaktion für den gesamten Warenkorb
      await transactionsService.create({
        transaction_type: TransactionType.PURCHASE,
        amount: total,
        payment_method: 'balance',
        user_id: user.id, // Required field
        description: `Warenkorb: ${items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`,
      })

      toast.success('Kauf erfolgreich!')
      clearCart()

      // Update user balance (reload von Server wäre besser)
      const updatedUser = { ...user, balance: user.balance - total }
      updateUser(updatedUser)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Kauf fehlgeschlagen')
    }
  }}
>

        {canAfford ? 'Jetzt bezahlen' : 'Nicht genug Guthaben'}
      </Button>

      {!canAfford && (
        <p className="text-xs text-danger-600 text-center mt-2">
          Bitte Guthaben aufladen
        </p>
      )}
    </Card>
  )
}
