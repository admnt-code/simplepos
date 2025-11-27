import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks'
import { Button, Input, Card } from '@/components/ui'
import { FEATURES } from '@/config/features'
import toast from 'react-hot-toast'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, loginRFID, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rfidMode, setRfidMode] = useState(false)
  const [rfidToken, setRfidToken] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Verhindere Event-Bubbling
    
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (error: any) {
      // Username bleibt erhalten, nur Passwort wird geleert
      setPassword('')
      
      // Zeige spezifische Fehlermeldung
      const errorMessage = error?.response?.data?.detail || error?.message || 'Anmeldung fehlgeschlagen'
      
      if (errorMessage.toLowerCase().includes('credential') || 
          errorMessage.toLowerCase().includes('password') ||
          errorMessage.toLowerCase().includes('incorrect') ||
          errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Falscher Benutzername oder Passwort. Bitte erneut versuchen.')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleRFIDLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await loginRFID(rfidToken)
      navigate('/dashboard')
    } catch (error) {
      setRfidToken('')
      toast.error('RFID-Karte nicht erkannt. Bitte erneut scannen.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BC Colours Kiosk
          </h1>
          <p className="text-gray-600">
            Melde dich an, um fortzufahren
          </p>
        </div>

        {!rfidMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Benutzername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Dein Benutzername"
              required
            />
            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dein Passwort"
              required
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              icon={LogIn}
              loading={isLoading}
            >
              Anmelden
            </Button>

           {/* NEU: Password Reset Link */}
           <div className="text-center mt-4">
           <button
             type="button"
             onClick={() => navigate('/reset-password')}
             className="text-sm text-primary-600 hover:text-primary-700 underline"
            >
           Passwort vergessen?
           </button>
         </div>
         </form>
        ) : (
          <form onSubmit={handleRFIDLogin} className="space-y-4">
            <Input
              label="RFID-Karte scannen"
              type="text"
              value={rfidToken}
              onChange={(e) => setRfidToken(e.target.value)}
              placeholder="Karte an Leser halten..."
              autoFocus
              required
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              icon={CreditCard}
              loading={isLoading}
            >
              Mit RFID anmelden
            </Button>
          </form>
        )}
        {FEATURES.RFID_LOGIN && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setRfidMode(!rfidMode)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {rfidMode ? '← Zurück zur normalen Anmeldung' : 'Mit RFID anmelden →'}
          </button>
        </div>
        )}
        {/* Gästeverwaltung Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
         <p className="text-sm text-gray-600 mb-2">Für Gäste ohne Login</p>
         <a
           href="/guest-management"
           target="_blank"
           rel="noopener noreferrer"
           className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
          >
            Zur Gästeverwaltung →
  </a>
    </div>
     </Card>
    </div>
  )
}
