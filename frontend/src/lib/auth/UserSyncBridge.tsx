import { useEffect, useRef } from 'react'
import { useAuthClient } from './AuthProvider'
import { provisionUserAfterLogin } from './userSync'
import { trackMizzzEvent } from '@/modules/analytics/tracking'

const SYNC_KEY = 'creava.user-sync.last-sub'
const USER_SYNC_ENABLED = import.meta.env.VITE_USER_SYNC_ENABLED !== 'false'
const FIRST_LOGIN_FLAG_KEY = 'creava.user-lifecycle.first-login'
const ONBOARDING_FLAG_KEY = 'creava.user-lifecycle.onboarding-state'

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
      .then((result) => {
        if (result) {
          trackMizzzEvent('login_success', {
            sourceSite: result.appUser?.sourceSite ?? 'cross',
            locale,
            membershipStatus: result.appUser?.membershipStatus ?? 'unknown',
          })
          if (result.reason === 'first_login') {
            trackMizzzEvent('first_login_detected', {
              sourceSite: result.appUser?.sourceSite ?? 'cross',
              locale,
              membershipStatus: result.appUser?.membershipStatus ?? 'unknown',
            })
            if (canUseSessionStorage()) {
              window.sessionStorage.setItem(FIRST_LOGIN_FLAG_KEY, 'true')
            }
          }
          if (result.appUser?.onboardingState) {
            if (canUseSessionStorage()) {
              window.sessionStorage.setItem(ONBOARDING_FLAG_KEY, result.appUser.onboardingState)
            }
          }
        }
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
