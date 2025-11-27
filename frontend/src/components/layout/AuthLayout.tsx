import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAutoPageTitle } from '@/hooks'

/**
 * AuthLayout - Minimales Layout für Login/Auth Pages
 * Nur für den automatischen Page-Titel Hook
 */
export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useAutoPageTitle()  // Automatischer Titel
  
  return <>{children || <Outlet />}</>
}
