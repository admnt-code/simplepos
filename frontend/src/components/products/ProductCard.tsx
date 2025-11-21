import React from 'react'
import { Plus, Minus } from 'lucide-react'
import { Product } from '@/types'
import { Card, Badge, Button } from '@/components/ui'
import { useCart } from '@/hooks'
import { formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, items, updateQuantity } = useCart()
  
  const cartItem = items.find((item) => item.product.id === product.id)
  const quantity = cartItem?.quantity || 0

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      DRINKS: 'info',
      SNACKS: 'warning',
      FOOD: 'success',
      OTHER: 'default',
    }
    return colors[category] || 'default'
  }

  return (
    <Card
      padding={false}
      hover
      className="overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 h-24 flex items-center justify-center">
        <p className="text-3xl font-bold text-white">
          {formatCurrency(product.member_price)}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          <Badge variant={getCategoryColor(product.category) as any} size="sm">
            {product.category}
          </Badge>
        </div>

        {product.variant && (
          <p className="text-sm text-gray-500 mb-2">{product.variant}</p>
        )}

        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto">
          {quantity === 0 ? (
            <Button
              variant="primary"
              fullWidth
              icon={Plus}
              onClick={() => addItem(product)}
              disabled={!product.is_available}
            >
              Hinzufügen
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-primary-700">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {!product.is_available && (
        <div className="bg-gray-100 px-4 py-2 text-center">
          <span className="text-sm text-gray-600">Nicht verfügbar</span>
        </div>
      )}
    </Card>
  )
}
