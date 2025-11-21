import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { Card, Button } from '@/components/ui'
import { Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const stats = [
    {
      title: 'Mein Guthaben',
      value: formatCurrency(user?.balance || 0),
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Heute gekauft',
      value: '0',
      icon: ShoppingBag,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
  ]

  const quickActions = [
    {
      title: 'Zur Kasse',
      description: 'Produkte kaufen',
      icon: ShoppingBag,
      path: '/pos',
      color: 'primary',
    },
    {
      title: 'Guthaben aufladen',
      description: 'Mit SumUp bezahlen',
      icon: Wallet,
      path: '/topup',
      color: 'success' as any,
    },
  ]

  if (isAdmin) {
    quickActions.push(
      {
        title: 'Produkte',
        description: 'Sortiment verwalten',
        icon: Package,
        path: '/products',
        color: 'warning',
      },
      {
      title: 'Benutzer',
      description: 'Verwaltung',
      icon: Users,
      path: '/users',
      color: 'warning' as any,
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen zurück, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Hier ist deine Übersicht
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              hover
              onClick={() => navigate(action.path)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-${action.color}-50 p-3 rounded-lg`}
                >
                  <action.icon className={`h-8 w-8 text-${action.color}-600`} />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Card>
          ))}
        </div>
      </div>

     {/* Recent Activity */}
<Card>
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Letzte Aktivität
  </h2>
  <RecentTransactions limit={5} />
</Card> 
  )
}
