export interface DeferredInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const PWA_INSTALL_DISMISSED_AT_KEY = 'creava.pwa.install.dismissedAt'
export const PWA_INSTALL_LAST_SHOWN_AT_KEY = 'creava.pwa.install.lastShownAt'

const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7
const REPEAT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 2

export function canShowInstallPrompt(now = Date.now()): boolean {
  if (typeof window === 'undefined') return false

  const dismissedAt = Number(localStorage.getItem(PWA_INSTALL_DISMISSED_AT_KEY) || 0)
  if (dismissedAt > 0 && now - dismissedAt < DISMISS_COOLDOWN_MS) return false

  const lastShownAt = Number(localStorage.getItem(PWA_INSTALL_LAST_SHOWN_AT_KEY) || 0)
  if (lastShownAt > 0 && now - lastShownAt < REPEAT_COOLDOWN_MS) return false

  return true
}

export function markInstallPromptShown(now = Date.now()): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PWA_INSTALL_LAST_SHOWN_AT_KEY, String(now))
}

export function markInstallPromptDismissed(now = Date.now()): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PWA_INSTALL_DISMISSED_AT_KEY, String(now))
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function detectInstallGuidancePlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'desktop'
}
