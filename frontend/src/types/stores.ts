import { User, Product, CartItem } from './index'

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  loginRFID: (rfidToken: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  updateUser: (user: User) => void
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  checkout: (paymentMethod: string) => Promise<void>
}

export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: 'de' | 'en'
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'de' | 'en') => void
}
