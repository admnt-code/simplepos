import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks'
import { Button, Input, Card } from '@/components/ui'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, loginRFID, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rfidMode, setRfidMode] = useState(false)
  const [rfidToken, setRfidToken] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by toast in store
    }
  }

  const handleRFIDLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await loginRFID(rfidToken)
      navigate('/dashboard')
    } catch (error) {
      setRfidToken('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vereinskasse
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

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setRfidMode(!rfidMode)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {rfidMode ? '← Zurück zur normalen Anmeldung' : 'Mit RFID anmelden →'}
          </button>
        </div>
      </Card>
    </div>
  )
}
