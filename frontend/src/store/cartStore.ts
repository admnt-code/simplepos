import { create } from 'zustand'
import { CartState } from '@/types/store'
import { Product } from '@/types'
import toast from 'react-hot-toast'

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addItem: (product: Product, quantity = 1) => {
    const { items } = get()
    const existingItem = items.find((item) => item.product.id === product.id)

    if (existingItem) {
      const updatedItems = items.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
              total_price: (item.quantity + quantity) * product.member_price,
            }
          : item
      )
      set({
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.total_price, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      })
      toast.success(`${product.name} aktualisiert`)
    } else {
      const newItem = {
        product,
        quantity,
        total_price: quantity * product.member_price,
      }
      const updatedItems = [...items, newItem]
      set({
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.total_price, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      })
      toast.success(`${product.name} hinzugefügt`)
    }
  },

  removeItem: (productId: number) => {
    const { items } = get()
    const item = items.find((item) => item.product.id === productId)
    const updatedItems = items.filter((item) => item.product.id !== productId)
    
    set({
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.total_price, 0),
      itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
    })
    
    if (item) {
      toast.success(`${item.product.name} entfernt`)
    }
  },

  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    const { items } = get()
    const updatedItems = items.map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity,
            total_price: quantity * item.product.member_price,
          }
        : item
    )
    
    set({
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.total_price, 0),
      itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  },

  clearCart: () => {
    set({
      items: [],
      total: 0,
      itemCount: 0,
    })
    toast.success('Warenkorb geleert')
  },

  checkout: async (paymentMethod: string) => {
    const { items, total, clearCart } = get()
    
    if (items.length === 0) {
      toast.error('Warenkorb ist leer')
      return
    }

    try {
      // Hier würde die API-Anfrage zum Checkout kommen
      toast.success(`Zahlung über ${paymentMethod} erfolgreich!`)
      clearCart()
    } catch (error) {
      toast.error('Checkout fehlgeschlagen')
      throw error
    }
  },
}))
