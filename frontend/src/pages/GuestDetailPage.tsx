import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button } from '@/components/ui'
import { ArrowLeft, ShoppingBag, Receipt, Trash2, CreditCard, Banknote } from 'lucide-react'
import { guestsService } from '@/lib/api'
import { GuestCloseTabRequest } from '@/types'
import toast from 'react-hot-toast'

export const GuestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cloud_api'>('cash')

  const guestId = parseInt(id!)

  // Fetch guest details
  const { data: guest, isLoading } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: () => guestsService.getById(guestId),
    enabled: !!guestId,
  })

  // Close tab mutation
  const closeTabMutation = useMutation({
    mutationFn: (data: GuestCloseTabRequest) => guestsService.closeTab(guestId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      queryClient.invalidateQueries({ queryKey: ['guest', guestId] })
      toast.success(`Rechnung erstellt: ${response.total.toFixed(2)} €`)
      navigate('/guest-management')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Abschließen')
    },
  })

  const handleCloseTab = () => {
    if (!guest || guest.total_amount === 0) {
      toast.error('Keine offenen Positionen vorhanden')
      return
    }

    closeTabMutation.mutate({ payment_method: paymentMethod })
  }

  if (isLoading) {
    return <div className="p-8">Lade Gast-Details...</div>
  }

  if (!guest) {
    return <div className="p-8">Gast nicht gefunden</div>
  }

  const unpaidItems = guest.tab_items.filter(item => !item.paid)
  const unpaidTotal = unpaidItems.reduce((sum, item) => sum + item.total_amount, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/guest-management')}
        >
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{guest.name}</h1>
          <p className="text-gray-600 mt-1">
            Tab erstellt am {new Date(guest.created_at).toLocaleDateString('de-DE')} um{' '}
            {new Date(guest.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Offene Positionen</p>
            <p className="text-2xl font-bold text-gray-900">{unpaidItems.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Offener Betrag</p>
            <p className="text-2xl font-bold text-primary-600">
              {unpaidTotal.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Gesamt-Umsatz</p>
            <p className="text-2xl font-bold text-gray-900">
              {guest.total_amount.toFixed(2)} €
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          icon={ShoppingBag}
          onClick={() => navigate(`/guest-pos/${guest.id}`)}
        >
          Weitere Bestellung
        </Button>
        <Button
          variant="success"
          icon={Receipt}
          onClick={() => setShowCloseModal(true)}
          disabled={unpaidItems.length === 0}
        >
          Rechnung erstellen
        </Button>
      </div>

      {/* Tab Items */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tab-Positionen</h2>
        
        {guest.tab_items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Noch keine Bestellungen
          </div>
        ) : (
          <div className="space-y-2">
            {guest.tab_items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  item.paid ? 'bg-gray-50 opacity-60' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{item.product_name}</span>
                    {item.paid && (
                      <span className="text-xs px-2 py-1 bg-success-100 text-success-700 rounded">
                        Bezahlt
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.quantity}x à {item.price_per_item.toFixed(2)} € •{' '}
                    {new Date(item.created_at).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {item.total_amount.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {unpaidItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Zu zahlen:</span>
              <span className="text-2xl font-bold text-primary-600">
                {unpaidTotal.toFixed(2)} €
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Close Tab Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rechnung erstellen</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Zu zahlender Betrag</p>
              <p className="text-3xl font-bold text-gray-900">
                {unpaidTotal.toFixed(2)} €
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Zahlungsmethode wählen
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                    paymentMethod === 'cash'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="h-6 w-6 text-gray-600" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">Bar</p>
                    <p className="text-sm text-gray-500">Barzahlung beim Mitarbeiter</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('cloud_api')}
                  className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                    paymentMethod === 'cloud_api'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-gray-600" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">SumUp</p>
                    <p className="text-sm text-gray-500">Kartenzahlung</p>
                  </div>
                  {paymentMethod === 'cloud_api' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="success"
                fullWidth
                onClick={handleCloseTab}
                loading={closeTabMutation.isPending}
              >
                Rechnung erstellen
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowCloseModal(false)}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
