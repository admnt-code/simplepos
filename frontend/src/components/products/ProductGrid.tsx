import React from 'react'
import { Product, ProductCategory } from '@/types'
import { ProductCard } from './ProductCard'
import { LoadingSpinner } from '@/components/ui'

interface ProductGridProps {
  products?: Product[]
  isLoading?: boolean
  category?: ProductCategory
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products = [],
  isLoading = false,
  category,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const filteredProducts = category
    ? products.filter((p) => p.category === category)
    : products

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Produkte gefunden</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
