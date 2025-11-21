import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProducts } from '@/hooks'
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export const ProductsPage: React.FC = () => {
  const { data: products, isLoading } = useProducts(undefined, false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produkte</h1>
          <p className="text-gray-600 mt-2">
            Verwalte alle Produkte
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Neues Produkt
        </Button>
      </div>

      {/* Products Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preis (Mitglied)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preis (Gast)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.variant && (
                        <p className="text-sm text-gray-500">{product.variant}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info" size="sm">
                      {product.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatCurrency(product.member_price)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatCurrency(product.guest_price)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={product.is_available ? 'success' : 'danger'}
                      size="sm"
                    >
                      {product.is_available ? 'Verfügbar' : 'Nicht verfügbar'}
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
