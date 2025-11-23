// User Types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  balance: number
  is_active: boolean
  is_admin: boolean
  rfid_token?: string
  created_at: string
  updated_at?: string
  last_login?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RFIDLoginRequest {
  rfid_token: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

// Product Types
export enum ProductCategory {
  DRINKS = 'DRINKS',
  SNACKS = 'SNACKS',
  FOOD = 'FOOD',
  OTHER = 'OTHER',
}

export interface Product {
  id: number
  name: string
  description?: string
  category: ProductCategory
  variant?: string
  member_price: number
  guest_price: number
  tax_rate: number
  stock_quantity?: number
  track_stock: boolean
  is_available: boolean
  sort_order: number
  created_at: string
  updated_at?: string
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
  total_price: number
}

// Transaction Types
export enum TransactionType {
  TOP_UP = 'top_up',
  TRANSFER = 'transfer',
  PURCHASE = 'purchase',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  SUMUP_CLOUD_API = 'cloud_api',
  SUMUP_PAYMENT_LINK = 'payment_link',
  BALANCE = 'balance',
  TRANSFER = 'transfer',
}

export interface Transaction {
  id: number
  transaction_reference: string
  user_id?: number
  transaction_type: TransactionType
  status: TransactionStatus
  amount: number
  balance_before?: number
  balance_after?: number
  payment_method?: PaymentMethod
  sumup_checkout_id?: string
  sumup_transaction_code?: string
  transfer_to_user_id?: number
  description?: string
  created_by_admin_id?: number
  created_at: string
  completed_at?: string
}

// Purchase Types
export interface Purchase {
  id: number
  purchase_reference: string
  user_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  total_price: number
  tax_rate: number
  tax_amount: number
  balance_before?: number
  balance_after?: number
  created_at: string
}

// Guest Types
export interface Guest {
  id: number
  name: string
  guest_number: string
  is_active: boolean
  is_archived: boolean
  created_at: string
  archived_at?: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// SumUp Types
export interface SumUpCheckout {
  checkout_id: string
  amount: number
  currency: string
  status: string
  payment_link?: string
}

export interface TopUpRequest {
  amount: number
  payment_method?: 'cloud_api' | 'payment_link'
}

// Settings Types
export interface SystemSettings {
  id: number
  sumup_mode: 'cloud_api' | 'payment_link' | 'disabled'
  default_language: string
  maintenance_mode: boolean
  updated_at: string
}

// UI State Types
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface Modal {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
  onClose?: () => void
}

// Form Types
export interface ProductFormData {
  name: string
  description?: string
  category: ProductCategory
  variant?: string
  member_price: number
  guest_price: number
  tax_rate: number
  track_stock: boolean
  stock_quantity?: number
  is_available: boolean
  sort_order: number
}

export interface UserFormData {
  username: string
  email: string
  password?: string
  first_name: string
  last_name: string
  balance: number
  is_active: boolean
  is_admin: boolean
  rfid_token?: string
}

export interface TransactionFormData {
  user_id?: number
  transaction_type: string
  amount: number
  payment_method?: string
  description?: string
}

// Filter & Sort Types
export interface ProductFilters {
  category?: ProductCategory
  available_only?: boolean
  search?: string
}

export interface TransactionFilters {
  user_id?: number
  transaction_type?: TransactionType
  status?: TransactionStatus
  date_from?: string
  date_to?: string
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}
