import { SITE_TYPE } from '@/lib/siteLinks'

export type SourceSite = 'main' | 'store' | 'fc'
export type UserState = 'guest' | 'logged_in'

type AuthenticatedState = 'authenticated' | 'anonymous'

export interface AnalyticsBaseContext {
  sourceSite: SourceSite
  locale: string
  theme: 'light' | 'dark'
  pageType: string
  userState: UserState
  authenticatedState: AuthenticatedState
  anonymousState: 'anonymous' | 'known_anonymous'
  sessionId: string
  anonymousId: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  referrerType: 'direct' | 'internal' | 'external'
  attributionState: 'unattributed' | 'last_touch'
  timestamp: string
}

const DEFAULT_LOCALE = 'ja'
const SESSION_KEY = 'mizzz_analytics_session_v1'
const ANON_KEY = 'mizzz_analytics_anonymous_v1'

function normalizeSourceSite(): SourceSite {
  if (SITE_TYPE === 'store') return 'store'
  if (SITE_TYPE === 'fanclub') return 'fc'
  return 'main'
}

function detectTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function detectReferrerType(): 'direct' | 'internal' | 'external' {
  if (typeof document === 'undefined' || !document.referrer) return 'direct'

  try {
    const referrer = new URL(document.referrer)
    if (referrer.origin === window.location.origin) return 'internal'
    return 'external'
  } catch {
    return 'external'
  }
}

function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_unified_access_token') || localStorage.getItem('logto_access_token')
}

function detectUserState(): UserState {
  return readAuthToken() ? 'logged_in' : 'guest'
}

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function getOrCreateStorageId(key: string, prefix: string): string {
  if (typeof window === 'undefined') return randomId(prefix)
  const existing = sessionStorage.getItem(key) ?? localStorage.getItem(key)
  if (existing) return existing
  const created = randomId(prefix)
  if (key === SESSION_KEY) {
    sessionStorage.setItem(key, created)
  } else {
    localStorage.setItem(key, created)
  }
  return created
}

export function inferPageType(pathname: string): string {
  if (!pathname || pathname === '/') return 'home'
  if (pathname.startsWith('/products') || pathname.startsWith('/store')) return 'product'
  if (pathname.startsWith('/contact')) return 'contact'
  if (pathname.startsWith('/support')) return 'support'
  if (pathname.startsWith('/faq')) return 'faq'
  if (pathname.startsWith('/guide')) return 'guide'
  if (pathname.startsWith('/events')) return 'event'
  if (pathname.startsWith('/news')) return 'news'
  if (pathname.startsWith('/blog')) return 'blog'
  if (pathname.startsWith('/join')) return 'join'
  if (pathname.startsWith('/login')) return 'login'
  if (pathname.startsWith('/mypage') || pathname.startsWith('/member')) return 'mypage'
  if (pathname.startsWith('/legal') || pathname.startsWith('/privacy') || pathname.startsWith('/terms')) return 'legal'
  return 'other'
}

export function getAnalyticsBaseContext(pathname: string): AnalyticsBaseContext {
  const locale = typeof document === 'undefined'
    ? DEFAULT_LOCALE
    : (document.documentElement.lang || DEFAULT_LOCALE)

  const userState = detectUserState()

  return {
    sourceSite: normalizeSourceSite(),
    locale,
    theme: detectTheme(),
    pageType: inferPageType(pathname),
    userState,
    authenticatedState: userState === 'logged_in' ? 'authenticated' : 'anonymous',
    anonymousState: userState === 'logged_in' ? 'known_anonymous' : 'anonymous',
    sessionId: getOrCreateStorageId(SESSION_KEY, 'sess'),
    anonymousId: getOrCreateStorageId(ANON_KEY, 'anon'),
    deviceType: detectDeviceType(),
    referrerType: detectReferrerType(),
    attributionState: detectReferrerType() === 'direct' ? 'unattributed' : 'last_touch',
    timestamp: new Date().toISOString(),
  }
}
