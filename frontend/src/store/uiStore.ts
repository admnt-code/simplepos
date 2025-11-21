import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UIState } from '@/types/store'

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      language: 'de',

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },

      setLanguage: (language: 'de' | 'en') => {
        set({ language })
      },
    }),
    {
      name: 'ui-storage',
    }
  )
)
