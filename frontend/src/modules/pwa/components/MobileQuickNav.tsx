import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/routeConstants'
import { SITE_TYPE } from '@/lib/siteLinks'
import { trackMizzzEvent } from '@/modules/analytics/tracking'

interface QuickItem {
  to: string
  labelKey: string
  icon: string
}

const MAIN_ITEMS: QuickItem[] = [
  { to: ROUTES.HOME, labelKey: 'pwa.quickNav.home', icon: '⌂' },
  { to: ROUTES.DISCOVERY, labelKey: 'pwa.quickNav.discover', icon: '⌕' },
  { to: ROUTES.EVENTS, labelKey: 'pwa.quickNav.events', icon: '◷' },
  { to: ROUTES.MEMBER, labelKey: 'pwa.quickNav.member', icon: '☺' },
]

const STORE_ITEMS: QuickItem[] = [
  { to: ROUTES.STORE_HOME, labelKey: 'pwa.quickNav.home', icon: '⌂' },
  { to: ROUTES.STORE_PRODUCTS, labelKey: 'pwa.quickNav.products', icon: '▦' },
  { to: ROUTES.DISCOVERY, labelKey: 'pwa.quickNav.discover', icon: '⌕' },
  { to: ROUTES.STORE_CART, labelKey: 'pwa.quickNav.cart', icon: '◍' },
]

const FC_ITEMS: QuickItem[] = [
  { to: ROUTES.HOME, labelKey: 'pwa.quickNav.home', icon: '⌂' },
  { to: ROUTES.FC_MYPAGE, labelKey: 'pwa.quickNav.mypage', icon: '☺' },
  { to: ROUTES.NEWS, labelKey: 'pwa.quickNav.news', icon: '✦' },
  { to: ROUTES.DISCOVERY, labelKey: 'pwa.quickNav.discover', icon: '⌕' },
]

function getItems(): QuickItem[] {
  if (SITE_TYPE === 'store') return STORE_ITEMS
  if (SITE_TYPE === 'fanclub') return FC_ITEMS
  return MAIN_ITEMS
}

export default function MobileQuickNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const items = getItems()

  return (
    <nav aria-label={t('pwa.quickNav.ariaLabel')} className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/70 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-950/95">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.to
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => trackMizzzEvent('bottom_nav_click', { target: item.to, sourceSite: SITE_TYPE })}
                className={`flex flex-col items-center justify-center rounded-lg px-2 py-1.5 text-[11px] ${active ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-200' : 'text-gray-500 dark:text-gray-300'}`}
              >
                <span aria-hidden className="text-sm leading-none">{item.icon}</span>
                <span className="mt-1 truncate">{t(item.labelKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
