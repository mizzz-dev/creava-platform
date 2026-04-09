import type { PlayfulSite } from './types'

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage unavailable — no-op
  }
}

/** 訪問回数カウント */
export function getVisitCount(site: PlayfulSite): number {
  return parseInt(safeGetItem(`mizzz.playful.visits.${site}`) ?? '0', 10)
}

export function incrementVisitCount(site: PlayfulSite): number {
  const next = getVisitCount(site) + 1
  safeSetItem(`mizzz.playful.visits.${site}`, String(next))
  return next
}

/** イースターエッグ発見済みフラグ */
export function isEasterEggFound(id: string): boolean {
  return safeGetItem(`mizzz.playful.egg.${id}`) === '1'
}

export function markEasterEggFound(id: string): void {
  safeSetItem(`mizzz.playful.egg.${id}`, '1')
}

/** ログイン時グリーティング（1日1回） */
export function getLoginGreetingDate(): string | null {
  return safeGetItem('mizzz.playful.greeting_date')
}

export function setLoginGreetingDate(dateStr: string): void {
  safeSetItem('mizzz.playful.greeting_date', dateStr)
}

/** 非表示にしたヒントのID */
export function isDismissed(id: string): boolean {
  return safeGetItem(`mizzz.playful.dismissed.${id}`) === '1'
}

export function markDismissed(id: string): void {
  safeSetItem(`mizzz.playful.dismissed.${id}`, '1')
}
