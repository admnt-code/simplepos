import React, { useState } from 'react'
import { ProductCategory } from '@/types'
import { useProducts } from '@/hooks'
import {
  ProductGrid,
  CategoryFilter,
} from '@/components/products'
import { CartSummary } from '@/components/cart'
import { Input } from '@/components/ui'
import { Search } from 'lucide-react'

export const POSPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>()
  const [searchQuery, setSearchQuery] = useState('')
  const { data: products, isLoading } = useProducts()

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kasse (POS)</h1>
        <p className="text-gray-600 mt-2">
          Wähle Produkte aus und lege sie in den Warenkorb
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Produkte suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
          </div>

          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
          />
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
