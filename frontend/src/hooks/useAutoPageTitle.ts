import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_TITLES, DEFAULT_TITLE, APP_NAME } from '@/config/pageTitles'

/**
 * Hook der automatisch den Page-Titel basierend auf der aktuellen Route setzt
 * 
 * Verwendet die zentrale PAGE_TITLES Config aus config/pageTitles.ts
 * Unterstützt:
 * - Statische Routen: '/dashboard' → 'Dashboard - BC Colours'
 * - Dynamische Routen: '/guests/:id' → 'Gast Details - BC Colours'
 * - Routen ohne App-Name: { title: 'Login', noAppName: true } → 'Login'
 * - Fallback: Nicht definierte Routen → 'BC Colours Verzehrsystem'
 */
export const useAutoPageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname

    // Versuche exakte Route zu finden
    let titleConfig = PAGE_TITLES[currentPath]

    // Falls nicht gefunden, versuche dynamische Routen zu matchen
    if (!titleConfig) {
      // Finde Route mit Parameter (z.B. /guests/:id matched /guests/123)
      const matchedRoute = Object.keys(PAGE_TITLES).find(route => {
        // Ersetze :param mit regex
        const pattern = route.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(currentPath)
      })

      if (matchedRoute) {
        titleConfig = PAGE_TITLES[matchedRoute]
      }
    }

    // Setze Titel
    if (titleConfig) {
      if (typeof titleConfig === 'string') {
        // Einfacher String: Titel + App Name
        document.title = `${titleConfig} - ${APP_NAME}`
      } else {
        // Objekt mit noAppName Option
        document.title = titleConfig.noAppName 
          ? titleConfig.title 
          : `${titleConfig.title} - ${APP_NAME}`
      }
    } else {
      // Fallback zum Default
      document.title = DEFAULT_TITLE
    }
  }, [location.pathname])
}
