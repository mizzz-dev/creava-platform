import { useEffect, useRef } from 'react'
import { useAuthClient } from './AuthProvider'
import { provisionUserAfterLogin } from './userSync'

const SYNC_KEY = 'creava.user-sync.last-sub'
const USER_SYNC_ENABLED = import.meta.env.VITE_USER_SYNC_ENABLED !== 'false'

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export default function UserSyncBridge() {
  const auth = useAuthClient()
  const inFlightRef = useRef(false)

  useEffect(() => {
    if (!USER_SYNC_ENABLED || !auth.isEnabled || !auth.isLoaded || !auth.isSignedIn) return

    const sub = typeof auth.claims?.sub === 'string' ? auth.claims.sub : null
    if (!sub || inFlightRef.current) return

    if (canUseSessionStorage() && window.sessionStorage.getItem(SYNC_KEY) === sub) {
      return
    }

    const locale = typeof auth.claims?.locale === 'string' ? auth.claims.locale : 'ja'
    inFlightRef.current = true

    provisionUserAfterLogin(auth.getAccessToken, locale)
      .then(() => {
        if (canUseSessionStorage()) {
          window.sessionStorage.setItem(SYNC_KEY, sub)
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn('[user-sync] provisioning skipped', error)
        }
      })
      .finally(() => {
        inFlightRef.current = false
      })
  }, [auth])

  return null
}
