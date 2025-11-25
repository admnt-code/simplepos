import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout } from '@/components/layout'
import {
  LoginPage,
  DashboardPage,
  POSPage,
  AdminProductsPage,
  TransactionsPage,
  ProfilePage,
  TopUpPage,
  PasswordResetPage,
  GuestManagementPage,
  GuestDetailPage,
  GuestPOSPage,
} from '@/pages'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/reset-password',
    element: <PasswordResetPage />,
  },
        // Guest Management Routes
      {
        path: 'guest-management',
        element: <GuestManagementPage />,
      },
      {
        path: 'guests/:id',
        element: <GuestDetailPage />,
      },
      {
        path: 'guest-pos/:id',
        element: <GuestPOSPage />,
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
      // Admin Routes
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
