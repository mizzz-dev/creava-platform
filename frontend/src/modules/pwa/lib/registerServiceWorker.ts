import { trackMizzzEvent } from '@/modules/analytics/tracking'

const ENABLE_PWA = (import.meta.env.VITE_ENABLE_PWA as string | undefined) !== 'false'

export function registerServiceWorker(): void {
  if (!ENABLE_PWA) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        trackMizzzEvent('pwa_sw_update_found')
      })
    }).catch(() => {
      trackMizzzEvent('pwa_sw_register_failed')
    })
  })
}
