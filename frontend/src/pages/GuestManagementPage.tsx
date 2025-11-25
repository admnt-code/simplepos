import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input } from '@/components/ui'
import { Plus, Users, ShoppingBag, Receipt, Trash2, Edit2 } from 'lucide-react'
import { guestsService } from '@/lib/api'
import { Guest, GuestFormData } from '@/types'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const GuestManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [editGuestName, setEditGuestName] = useState('')

  // Fetch active guests
  const { data: guests, isLoading } = useQuery({
    queryKey: ['guests', true],
    queryFn: () => guestsService.getAll(true),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: GuestFormData) => guestsService.create(data),
    onSuccess: (newGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      toast.success('Gast angelegt!')
      setShowModal(false)
      setGuestName('')
      navigate(`/guest-pos/${newGuest.id}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Anlegen')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => guestsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      toast.success('Gast gelöscht!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Löschen')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GuestFormData> }) =>
      guestsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      toast.success('Name aktualisiert!')
      setEditingGuest(null)
      setEditGuestName('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Aktualisieren')
    },
  })

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim()) {
      toast.error('Bitte Namen eingeben')
      return
    }
    createMutation.mutate({ name: guestName })
  }

  const handleDelete = (guest: Guest) => {
    if (guest.total_amount > 0) {
      toast.error('Gast hat bereits Positionen auf dem Tab')
      return
    }

    if (confirm(`Gast "${guest.name}" wirklich löschen?`)) {
      deleteMutation.mutate(guest.id)
    }
  }

  const handleEditStart = (guest: Guest) => {
    setEditingGuest(guest)
    setEditGuestName(guest.name)
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGuest || !editGuestName.trim()) return

    updateMutation.mutate({
      id: editingGuest.id,
      data: { name: editGuestName }
    })
  }

  if (isLoading) {
    return <div className="p-8">Lade Gäste...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gästeverwaltung</h1>
          <p className="text-gray-600 mt-2">Gäste anlegen und verwalten</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
          Neuer Gast
        </Button>
      </div>

      {/* Guest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guests?.map((guest) => (
          <Card key={guest.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                  <p className="text-sm text-gray-500">
                    {guest.tab_items.length} Position{guest.tab_items.length !== 1 ? 'en' : ''}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditStart(guest)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                  title="Namen bearbeiten"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {guest.total_amount === 0 && (
                  <button
                    onClick={() => handleDelete(guest)}
                    className="p-2 text-error-600 hover:bg-error-50 rounded-lg"
                    title="Gast löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">Aktueller Tab</p>
              <p className="text-2xl font-bold text-gray-900">
                {guest.total_amount.toFixed(2)} €
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                icon={ShoppingBag}
                onClick={() => navigate(`/guest-pos/${guest.id}`)}
                fullWidth
              >
                Verzehr buchen
              </Button>
              <Button
                variant="ghost"
                icon={Receipt}
                onClick={() => navigate(`/guests/${guest.id}`)}
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {guests?.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Noch keine aktiven Gäste</p>
            <p className="text-sm text-gray-400 mt-2">
              Klicke auf "Neuer Gast" um zu starten
            </p>
          </div>
        </Card>
      )}

      {/* Create Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Neuer Gast</h2>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <Input
                label="Name des Gastes *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Max Mustermann"
                autoFocus
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={createMutation.isPending}
                >
                  Anlegen & Verzehr buchen
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setShowModal(false)
                    setGuestName('')
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {editingGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Namen bearbeiten</h2>

            <form onSubmit={handleEditSave} className="space-y-4">
              <Input
                label="Name des Gastes *"
                value={editGuestName}
                onChange={(e) => setEditGuestName(e.target.value)}
                placeholder="Max Mustermann"
                autoFocus
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={updateMutation.isPending}
                >
                  Speichern
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setEditingGuest(null)
                    setEditGuestName('')
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
