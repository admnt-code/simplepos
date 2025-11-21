import { useCartStore } from '@/store'

export const useCart = () => {
  const {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout,
  } = useCartStore()

  return {
    items,
    total,
    itemCount,
    isEmpty: items.length === 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout,
  }
}
