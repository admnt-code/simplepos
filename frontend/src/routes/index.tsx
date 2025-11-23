
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout } from '@/components/layout'
import {
  LoginPage,
  DashboardPage,
  POSPage,
  ProductsPage,
  TransactionsPage,
  ProfilePage,
  TopUpPage,
  PasswordResetPage,
} from '@/pages'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/reset-password',  // NEU
    element: <PasswordResetPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'pos',
        element: <POSPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'profile',
       element: <ProfilePage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'topup',
        element: <TopUpPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin>
            <div>Users Page (Admin Only)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requireAdmin>
            <div>Settings Page (Admin Only)</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
