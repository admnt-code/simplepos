import { NavLink } from 'react-router-dom'
import {
  Home,
  ShoppingBag,
  Package,
  Receipt,
  Users,
  Settings,
  X,
  UserCog,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  path: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Verzehr buchen', path: '/pos', icon: ShoppingBag },
  { name: 'Guthaben aufladen', path: '/topup', icon: Wallet },
  { name: 'Produktverwaltung', path: '/admin/products', icon: Package, adminOnly: true },  // Geändert!
  { name: 'Transaktionen', path: '/transactions', icon: Receipt },
  { name: 'Benutzer', path: '/admin/users', icon: Users, adminOnly: true },
  { name: 'Einstellungen', path: '/settings', icon: Settings, adminOnly: true },
  { name: 'Mein Profil', path: '/profile', icon: UserCog },
]

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Header - EXAKT gleiche Höhe wie main Header */}
        <div className="flex items-center justify-between px-4 border-b border-gray-200 h-16">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)]">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
