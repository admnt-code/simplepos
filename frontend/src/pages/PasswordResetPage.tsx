import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Button } from '@/components/ui'
import { Mail, Key, ArrowLeft } from 'lucide-react'
import { authService } from '@/lib/api'
import toast from 'react-hot-toast'

export const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Bitte Email-Adresse eingeben')
      return
    }

    setLoading(true)
    try {
      const response = await authService.requestPasswordReset(email)
      toast.success(response.message)
      setStep('code')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Fehler beim Senden des Codes')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code || code.length !== 6) {
      toast.error('Bitte 6-stelligen Code eingeben')
      return
    }

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
      const response = await authService.verifyPasswordReset(email, code, newPassword)
      toast.success(response.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ungültiger Code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Passwort zurücksetzen
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 'email' 
                ? 'Gib deine Email-Adresse ein'
                : 'Code eingeben und neues Passwort setzen'
              }
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <Input
                label="Email-Adresse"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@example.com"
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Code anfordern
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                icon={ArrowLeft}
                onClick={() => navigate('/login')}
              >
                Zurück zum Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-primary-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  Ein 6-stelliger Code wurde an <strong>{email}</strong> gesendet.
                </p>
              </div>

              <Input
                label="6-stelliger Code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
              />

              <Input
                label="Neues Passwort"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Passwort bestätigen"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Passwort ändern
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => setStep('email')}
              >
                Anderen Code anfordern
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
