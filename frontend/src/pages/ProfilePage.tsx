import React, { useState } from 'react'
import { useAuth } from '@/hooks'
import { Card, Input, Button } from '@/components/ui'
import { Save, Key, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersService, authService } from '@/lib/api'

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [rfidToken, setRfidToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRFIDUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await usersService.update(user.id, { rfid_token: rfidToken })
      toast.success('RFID-Chip erfolgreich verknüpft')
      setRfidToken('')
      updateUser({ ...user, rfid_token: rfidToken })
    } catch (error) {
      toast.error('Fehler beim Verknüpfen des RFID-Chips')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein')
      return
    }

    setLoading(true)
    try {
      await authService.changePassword(newPassword)
      toast.success('Passwort erfolgreich geändert')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Fehler beim Ändern des Passworts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mein Profil</h1>
        <p className="text-gray-600 mt-2">
          Verwalte deine RFID-Karte und Passwort
        </p>
      </div>

      {/* RFID Verknüpfung */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-6 w-6 mr-2 text-primary-600" />
          RFID-Chip verknüpfen
        </h2>
        <form onSubmit={handleRFIDUpdate} className="space-y-4">
          <Input
            label="RFID-Token"
            type="text"
            value={rfidToken}
            onChange={(e) => setRfidToken(e.target.value)}
            placeholder="Karte an Leser halten..."
            autoFocus
          />
          {user?.rfid_token && (
            <p className="text-sm text-success-600">
              ✓ Aktuell verknüpft: {user.rfid_token.substring(0, 8)}...
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            loading={loading}
          >
            RFID-Chip speichern
          </Button>
        </form>
      </Card>

      {/* Passwort ändern */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="h-6 w-6 mr-2 text-primary-600" />
          Passwort ändern
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Neues Passwort"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Passwort bestätigen"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            icon={Save}
            loading={loading}
          >
            Passwort ändern
          </Button>
        </form>
      </Card>

    </div>
  )
}
