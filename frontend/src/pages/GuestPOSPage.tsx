import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button } from '@/components/ui'
import { ArrowLeft, ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { guestsService, productsService } from '@/lib/api'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface CartItem {
  product: Product
  quantity: number
}

export const GuestPOSPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const guestId = parseInt(id!)

  const [cart, setCart] = useState<CartItem[]>([])

  // Fetch guest
  const { data: guest } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: () => guestsService.getById(guestId),
    enabled: !!guestId,
  })

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', true],
    queryFn: () => productsService.getAll(undefined, true),
  })

  // Add to tab mutation
  const addToTabMutation = useMutation({
    mutationFn: async () => {
      // Add all cart items sequentially
      for (const item of cart) {
        await guestsService.addItemToTab(guestId, item.product.id, item.quantity)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest', guestId] })
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      toast.success('Auf Tab gebucht!')
      setCart([])
      navigate(`/guests/${guestId}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Buchen')
    },
  })

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: number) => {
    const existingItem = cart.find((item) => item.product.id === productId)
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      )
    } else {
      setCart(cart.filter((item) => item.product.id !== productId))
    }
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.guest_price * item.quantity,
    0
  )

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Warenkorb ist leer')
      return
    }

    addToTabMutation.mutate()
  }

  if (isLoading) {
    return <div className="p-8">Lade Produkte...</div>
  }

  if (!guest) {
    return <div className="p-8">Gast nicht gefunden</div>
  }

  // Group products by category
  const groupedProducts = products?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const categoryLabels: Record<string, string> = {
    drinks: 'Getränke',
    snacks: 'Snacks',
    food: 'Essen',
    other: 'Anderes',
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(`/guests/${guestId}`)}
        >
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Verzehr buchen</h1>
          <p className="text-gray-600">Gast: {guest.name}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Products */}
        <div className="lg:col-span-2 overflow-y-auto">
          <div className="space-y-6">
            {Object.entries(groupedProducts || {}).map(([category, categoryProducts]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {categoryLabels[category] || category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryProducts.map((product) => {
                    const cartItem = cart.find((item) => item.product.id === product.id)
                    const inCart = !!cartItem

                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          inCart
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {product.name}
                          </h3>
                          {inCart && (
                            <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {cartItem.quantity}
                            </span>
                          )}
                        </div>
                        {product.variant && (
                          <p className="text-xs text-gray-500 mb-2">{product.variant}</p>
                        )}
                        <p className="text-lg font-bold text-gray-900">
                          {product.guest_price.toFixed(2)} €
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-0">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Warenkorb ({cart.length})
              </h2>
            </div>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Warenkorb ist leer</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.product.guest_price.toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item.product)}
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-gray-900 w-20 text-right">
                      {(item.product.guest_price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Gesamt:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {cartTotal.toFixed(2)} €
                </span>
              </div>

              <Button
                variant="primary"
                icon={Check}
                fullWidth
                onClick={handleCheckout}
                disabled={cart.length === 0}
                loading={addToTabMutation.isPending}
              >
                Auf Tab buchen
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => setCart([])}
                disabled={cart.length === 0}
              >
                Warenkorb leeren
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
