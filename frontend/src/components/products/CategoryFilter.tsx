import React from 'react'
import { ProductCategory } from '@/types'
import { Button } from '@/components/ui'

interface CategoryFilterProps {
  selected?: ProductCategory
  onChange: (category?: ProductCategory) => void
}

const categories = [
  { value: undefined, label: 'Alle' },
  { value: ProductCategory.DRINKS, label: 'Getränke' },
  { value: ProductCategory.SNACKS, label: 'Snacks' },
  { value: ProductCategory.FOOD, label: 'Essen' },
  { value: ProductCategory.OTHER, label: 'Anderes' },
]

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.label}
          variant={selected === cat.value ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onChange(cat.value)}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
