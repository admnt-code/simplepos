import { useAuthStore } from '@/store'

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginRFID,
    logout,
    updateUser,
  } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.is_admin || false,
    login,
    loginRFID,
    logout,
    updateUser,
  }
}
