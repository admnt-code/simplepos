import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState } from '@/types/store'
import { authService, handleApiError } from '@/lib/api'
import toast from 'react-hot-toast'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true })
          const tokens = await authService.login({ username, password })

          const user = await authService.getCurrentUser()

          set({
            user,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Willkommen zurück, ${user.first_name}!`)
        } catch (error) {
          set({ isLoading: false })
          // ENTFERNT: toast.error(handleApiError(error))
          // Der Error wird zur LoginPage weitergegeben, die ihn behandelt
          throw error
        }
      },

      loginRFID: async (rfidToken: string) => {
        try {
          set({ isLoading: true })
          const tokens = await authService.loginRFID({ rfid_token: rfidToken })

          const user = await authService.getCurrentUser()

          set({
            user,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`Willkommen, ${user.first_name}!`)
        } catch (error) {
          set({ isLoading: false })
          // ENTFERNT: toast.error('RFID-Login fehlgeschlagen')
          // Der Error wird zur LoginPage weitergegeben
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        toast.success('Erfolgreich abgemeldet')
      },

      refreshAccessToken: async () => {
        try {
          const tokens = await authService.refreshToken()
          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          })
        } catch (error) {
          get().logout()
          throw error
        }
      },

      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
