import { Menu, LogOut, User, ShoppingCart } from 'lucide-react'
import { useAuth, useCart } from '@/hooks'
import { useUIStore } from '@/store'
import { Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { toggleSidebar } = useUIStore()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-10 h-16">
      <div className="flex items-center justify-between px-4 h-full">
	<h1 className="text-xl font-bold text-gray-900">Verzehrsystem BC Colours Düsseldorf e.V.</h1>
        {/* Left: Menu & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Right: User Info & Cart */}
        <div className="flex items-center space-x-4">
          {/* Cart Badge */}
          <div className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {itemCount > 0 && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-2 -right-2"
              >
                {itemCount}
              </Badge>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  Guthaben: {formatCurrency(user.balance)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Abmelden"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
