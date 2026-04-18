import { SITE_TYPE } from '@/lib/siteLinks'

const SITE_META = {
  main: { title: 'mizzz main', short: 'mizzz', color: '#111827' },
  store: { title: 'mizzz store', short: 'mizzz store', color: '#0f766e' },
  fanclub: { title: 'mizzz fanclub', short: 'mizzz fc', color: '#7c3aed' },
} as const

export function applySiteAppMeta(): void {
  if (typeof document === 'undefined') return
  const meta = SITE_TYPE === 'store' ? SITE_META.store : SITE_TYPE === 'fanclub' ? SITE_META.fanclub : SITE_META.main

  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute('content', meta.color)
  } else {
    const created = document.createElement('meta')
    created.setAttribute('name', 'theme-color')
    created.setAttribute('content', meta.color)
    document.head.appendChild(created)
  }

  document.documentElement.setAttribute('data-app-short-name', meta.short)
}
