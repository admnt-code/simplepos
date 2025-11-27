import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAutoPageTitle } from '@/hooks'  // NEU

export const GuestLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useAutoPageTitle()  // NEU - Automatischer Titel für Guest-Pages!
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
        <h1 className="text-xl font-bold text-primary-600">Vereinskasse - Gästeverwaltung</h1>
      </header>
      <main className="p-6">
        {children || <Outlet />}
      </main>
    </div>
  )
}
