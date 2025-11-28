import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks'
import { Button, Input, Card } from '@/components/ui'
import { FEATURES } from '@/config/features'
import toast from 'react-hot-toast'
import bcColoursLogo from '@/assets/bc-colours-logo.png'  // NEU

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, loginRFID, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rfidMode, setRfidMode] = useState(false)
  const [rfidToken, setRfidToken] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (error: any) {
      setPassword('')
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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      
      {/* Animated Mesh Gradient - BC Colours Style */}
      <div className="absolute inset-0">
        {/* Top Left - Rot */}
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ 
            backgroundColor: '#E31E24',
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        
        {/* Bottom Right - Gold */}
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ 
            backgroundColor: '#D4AF37',
            animation: 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '1s'
          }}
        />
        
        {/* Center - Rot Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ 
            backgroundColor: '#E31E24',
            animation: 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      </div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Glass Card with Glow */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow Effect behind Card - Rot */}
        <div 
          className="absolute inset-0 rounded-2xl blur-xl opacity-30"
          style={{ backgroundColor: '#E31E24' }}
        />
        
        {/* Main Card */}
        <Card className="relative backdrop-blur-2xl bg-white/95 shadow-2xl border border-white/20">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img 
                src={bcColoursLogo}
                alt="BC Colours Logo" 
                className="w-32 h-32 object-contain drop-shadow-xl"
              />
            </div>
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
    </div>
  )
}
