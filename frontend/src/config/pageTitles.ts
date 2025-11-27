/**
 * Zentrale Page-Titel Konfiguration
 * 
 * Hier werden alle Page-Titel für die verschiedenen Routen definiert.
 * Der Titel wird automatisch basierend auf der aktuellen Route gesetzt.
 * 
 * Format:
 * - Mit App-Name: 'Dashboard' → "Dashboard - BC Colours"
 * - Ohne App-Name: { title: 'Login', noAppName: true } → "Login"
 */

type PageTitleConfig = string | { title: string; noAppName?: boolean }

export const PAGE_TITLES: Record<string, PageTitleConfig> = {
  // Auth
  '/login': { title: 'Mitgliederverzehr - Login', noAppName: true },
  '/reset-password': 'Passwort zurücksetzen',
  
  // Main Pages
  '/dashboard': 'Dashboard',
  '/pos': 'Kasse',
  '/topup': 'Guthaben aufladen',
  '/transactions': 'Transaktionen',
  '/profile': 'Mein Profil',
  
  // Guest Management
  '/guest-management': 'Gästeverwaltung',
  '/guest-pos/:id': 'Gast Kasse',
  '/guests/:id': 'Gast Details',
  
  // Admin Pages
  '/admin/products': 'Produktverwaltung',
  '/admin/users': 'Benutzerverwaltung',
  '/settings': 'Einstellungen',
}

// Default Titel wenn keine Route matched
export const DEFAULT_TITLE = 'BC Colours Kiosk'

// App Name für Suffix
export const APP_NAME = 'BC Colours'
