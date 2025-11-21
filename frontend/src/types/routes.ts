export enum RoutePath {
  HOME = '/',
  LOGIN = '/login',
  DASHBOARD = '/dashboard',
  POS = '/pos',
  PRODUCTS = '/products',
  TRANSACTIONS = '/transactions',
  USERS = '/users',
  SETTINGS = '/settings',
  PROFILE = '/profile',
}

export interface RouteConfig {
  path: RoutePath
  requiresAuth: boolean
  requiresAdmin?: boolean
  element: React.ComponentType
}
