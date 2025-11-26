import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, LoadingSpinner, Modal, Input } from '@/components/ui'
import { usersService } from '@/lib/api'
import { UserCreateRequest, UserUpdateRequest, User, UserBalanceAdjustment, UserPasswordReset } from '@/types'
import { Users as UsersIcon, Plus, Edit, Trash2, Mail, Shield, DollarSign, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils'

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsCreateModalOpen(false)
      toast.success('Benutzer erfolgreich erstellt!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Erstellen')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) =>
      usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditModalOpen(false)
      setSelectedUser(null)
      toast.success('Benutzer erfolgreich aktualisiert!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Aktualisieren')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Benutzer erfolgreich gelöscht!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Löschen')
    },
  })

  // Adjust balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserBalanceAdjustment }) =>
      usersService.adjustBalance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsBalanceModalOpen(false)
      setSelectedUser(null)
      toast.success('Guthaben erfolgreich angepasst!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Anpassen des Guthabens')
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserPasswordReset }) =>
      usersService.resetPassword(id, data),
    onSuccess: () => {
      setIsPasswordModalOpen(false)
      setSelectedUser(null)
      toast.success('Passwort erfolgreich zurückgesetzt!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Fehler beim Zurücksetzen')
    },
  })

  const handleDelete = (user: User) => {
    if (window.confirm(`Benutzer "${user.first_name} ${user.last_name}" wirklich löschen?`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleAdjustBalance = (user: User) => {
    setSelectedUser(user)
    setIsBalanceModalOpen(true)
  }

  const handleResetPassword = (user: User) => {
    setSelectedUser(user)
    setIsPasswordModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Mitglieder und Administratoren</p>
        </div>
        <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
          Neuer Benutzer
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guthaben
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Mitglied
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.balance.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAdjustBalance(user)}
                          className="text-success-600 hover:text-success-900"
                          title="Guthaben anpassen"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="text-warning-600 hover:text-warning-900"
                          title="Passwort zurücksetzen"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-danger-600 hover:text-danger-900"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Keine Benutzer gefunden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={(data) => updateMutation.mutate({ id: selectedUser.id, data })}
          user={selectedUser}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <AdjustBalanceModal
          isOpen={isBalanceModalOpen}
          onClose={() => {
            setIsBalanceModalOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={(data) => adjustBalanceMutation.mutate({ id: selectedUser.id, data })}
          user={selectedUser}
          isLoading={adjustBalanceMutation.isPending}
        />
      )}

      {/* Reset Password Modal */}
      {selectedUser && (
        <ResetPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={(data) => resetPasswordMutation.mutate({ id: selectedUser.id, data })}
          user={selectedUser}
          isLoading={resetPasswordMutation.isPending}
        />
      )}
    </div>
  )
}

// Create User Modal Component
interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserCreateRequest) => void
  isLoading: boolean
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UserCreateRequest>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_admin: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_admin: false,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Neuer Benutzer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Benutzername"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          placeholder="z.B. jdoe"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="user@example.com"
        />
        <Input
          label="Vorname"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
        />
        <Input
          label="Nachname"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
        <Input
          label="Passwort"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          placeholder="Mindestens 6 Zeichen"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_admin"
            checked={formData.is_admin}
            onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-900">
            Administrator
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Erstelle...' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Edit User Modal Component
interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserUpdateRequest) => void
  user: User
  isLoading: boolean
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UserUpdateRequest>({
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Benutzer bearbeiten">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Benutzername"
          value={formData.username || ''}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          placeholder="z.B. jdoe"
        />
        <Input
          label="Vorname"
          value={formData.first_name || ''}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
        />
        <Input
          label="Nachname"
          value={formData.last_name || ''}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Speichere...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Adjust Balance Modal Component
interface AdjustBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserBalanceAdjustment) => void
  user: User
  isLoading: boolean
}

const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UserBalanceAdjustment>({
    amount: 0,
    description: '',
  })
  const [inputValue, setInputValue] = useState<string>('')  // NEU: Separater State für Input

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({ amount: 0, description: '' })
    setInputValue('')  // NEU
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Guthaben anpassen">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Aktuelles Guthaben: <span className="font-semibold">{user.balance.toFixed(2)} €</span>
        </p>
        <p className="text-sm text-gray-600">
          Benutzer: <span className="font-semibold">{user.first_name} {user.last_name}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Betrag (positiv = Einzahlung, negativ = Auszahlung)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value
              // Erlaube leeren String, nur Minus, oder Zahlen mit Minus/Punkt/Komma
              if (value === '' || value === '-' || /^-?\d*[.,]?\d*$/.test(value)) {
                setInputValue(value)
                // Ersetze Komma durch Punkt für Berechnung
                const normalizedValue = value.replace(',', '.')
                if (normalizedValue === '' || normalizedValue === '-') {
                  setFormData({ ...formData, amount: 0 })
                } else {
                  const num = parseFloat(normalizedValue)
                  setFormData({ ...formData, amount: isNaN(num) ? 0 : num })
                }
              }
            }}
            onBlur={(e) => {
              // Wenn nur "-" eingegeben wurde, setze auf leer
              if (e.target.value === '-' || e.target.value === '') {
                setInputValue('')
                setFormData({ ...formData, amount: 0 })
              }
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="z.B. 50.00 oder -20.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Begründung
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="z.B. Bar-Einzahlung, Überweisung erhalten, Korrektur, etc."
          />
        </div>
        {formData.amount !== 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              Neues Guthaben:{' '}
              <span className="font-semibold">
                {(user.balance + formData.amount).toFixed(2)} €
              </span>
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading || formData.amount === 0}>
            {isLoading ? 'Speichere...' : 'Anpassen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Reset Password Modal Component
interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserPasswordReset) => void
  user: User
  isLoading: boolean
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UserPasswordReset>({
    new_password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.new_password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      return
    }

    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({ new_password: '' })
    setConfirmPassword('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Passwort zurücksetzen">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Benutzer: <span className="font-semibold">{user.first_name} {user.last_name}</span>
        </p>
        <p className="text-sm text-gray-600">
          Email: <span className="font-semibold">{user.email}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Neues Passwort"
          type="password"
          value={formData.new_password}
          onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
          required
          placeholder="Mindestens 6 Zeichen"
          minLength={6}
        />
        <Input
          label="Passwort bestätigen"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Passwort wiederholen"
        />
        <div className="bg-warning-50 p-3 rounded-lg">
          <p className="text-sm text-warning-800">
            ⚠️ Der Benutzer wird nicht über die Passwortänderung informiert.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Setze zurück...' : 'Passwort zurücksetzen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
