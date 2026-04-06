import type { MemberPreferences } from './types'

const STORAGE_KEY = 'creava.member.preferences'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadMemberPreferences(): MemberPreferences | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as MemberPreferences
    if (typeof parsed.newsletterOptIn !== 'boolean' || typeof parsed.loginAlertOptIn !== 'boolean') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveMemberPreferences(preferences: MemberPreferences): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}
