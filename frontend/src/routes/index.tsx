import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout, GuestLayout, AuthLayout } from '@/components/layout'  // AuthLayout hinzufügen
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
  UsersPage,
} from '@/pages'

export const router = createBrowserRouter([
  // Auth Routes mit AuthLayout
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'reset-password',
        element: <PasswordResetPage />,
      },
    ],
  },
  
  // Guest Management Routes mit GuestLayout
  {
    path: '/',
    element: <GuestLayout />,
    children: [
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
    ],
  },

  // Protected Routes mit normalem Layout
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
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
