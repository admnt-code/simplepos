import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, LogIn, Search } from 'lucide-react'
import { useAuth } from '@/hooks'
import { Button, Input, Card } from '@/components/ui'
import { FEATURES } from '@/config/features'
import toast from 'react-hot-toast'
import bcColoursLogo from '@/assets/bc-colours-logo.png'

interface UserSearchResult {
  id: number
  username: string
  first_name: string
  last_name: string
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, loginRFID, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsername, setSelectedUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rfidMode, setRfidMode] = useState(false)
  const [rfidToken, setRfidToken] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<UserSearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredUsers([])
      setShowDropdown(false)
      return
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/v1/auth/users/search?q=${encodeURIComponent(searchTerm)}`)
        
        if (!response.ok) {
          if (response.status === 429) {
            toast.error('Zu viele Anfragen. Bitte kurz warten.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const filtered = await response.json()
        setFilteredUsers(filtered)
        setShowDropdown(filtered.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search failed:', error)
        setFilteredUsers([])
        setShowDropdown(false)
      }
    }

    // Debounce: Warte 300ms nach letzter Eingabe
    const timeoutId = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUserSelect = (user: UserSearchResult) => {
    setSearchTerm(`${user.last_name}, ${user.first_name}`)
    setSelectedUsername(user.username)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredUsers[selectedIndex]) {
          handleUserSelect(filteredUsers[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const username = selectedUsername || searchTerm
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
      
      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ 
            backgroundColor: '#E31E24',
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ 
            backgroundColor: '#D4AF37',
            animation: 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ 
            backgroundColor: '#E31E24',
            animation: 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      </div>

      {/* Grid Pattern */}
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

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md">
        <div 
          className="absolute inset-0 rounded-2xl blur-xl opacity-30"
          style={{ backgroundColor: '#E31E24' }}
        />
        
        <Card className="relative backdrop-blur-2xl bg-white/95 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img
                src={bcColoursLogo}
                alt="BC Colours Logo"
                className="w-32 h-32 object-contain drop-shadow-xl"
              />
            </div>
            <div className="flex justify-center mb-2">
              <h1 className="text-3xl font-bold text-gray-900 relative group cursor-help">
                Jeschrömt
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
                  Düsseldorfer Platt für "Einen Strich auf einen Bierdeckel gemacht zu haben 🍺"
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                </span>
              </h1>
            </div>
            <p className="text-gray-600">
              Melde dich an, um fortzufahren
            </p>
          </div>

          {!rfidMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Autocomplete Field */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benutzername
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setSelectedUsername('')
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Name suchen..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoComplete="off"
                    required
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Dropdown */}
                {showDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          index === selectedIndex ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {user.last_name}, {user.first_name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
