import type {
  ActivityItemState,
  ContinueJourneyItem,
  ContinueJourneyState,
  FavoriteItem,
  FavoriteState,
  GuestPersistenceState,
  PersonalizationEntityRef,
  RecommendationHookState,
  SavedCollectionState,
  ShareState,
  ShareStateItem,
  ShareTargetState,
  SyncState,
  ViewHistoryItem,
} from './types'

const STORAGE_KEYS = {
  continueJourney: 'creava.engagement.continue_journey',
  activityCenter: 'creava.engagement.activity_center',
  shareState: 'creava.engagement.share_state',
  syncState: 'creava.engagement.sync_state',
  guestPersistence: 'creava.engagement.guest_persistence',
} as const

const MAX_CONTINUE_ITEMS = 30
const MAX_ACTIVITY_ITEMS = 120

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function nowIso(): string {
  return new Date().toISOString()
}

function traceId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`
}

export function loadContinueJourney(): ContinueJourneyItem[] {
  if (!canUseStorage()) return []
  return safeParse(STORAGE_KEYS.continueJourney && window.localStorage.getItem(STORAGE_KEYS.continueJourney), [])
}

export function upsertContinueJourney(input: PersonalizationEntityRef, state: ContinueJourneyState): ContinueJourneyItem {
  const current = loadContinueJourney()
  const nextItem: ContinueJourneyItem = {
    id: `${input.kind}:${input.slug}`,
    ...input,
    continueJourneyState: state,
    updatedAt: nowIso(),
    resumedAt: state === 'in_progress' ? nowIso() : null,
  }
  const next = [nextItem, ...current.filter((item) => item.id !== nextItem.id)].slice(0, MAX_CONTINUE_ITEMS)
  save(STORAGE_KEYS.continueJourney, next)
  return nextItem
}

export function loadActivityCenter(): ActivityItemState[] {
  if (!canUseStorage()) return []
  return safeParse(window.localStorage.getItem(STORAGE_KEYS.activityCenter), [])
}

export function pushActivity(item: Omit<ActivityItemState, 'id' | 'createdAt' | 'unread' | 'archived'>): ActivityItemState {
  const nextItem: ActivityItemState = {
    ...item,
    id: traceId('activity'),
    createdAt: nowIso(),
    unread: true,
    archived: false,
  }
  const next = [nextItem, ...loadActivityCenter()].slice(0, MAX_ACTIVITY_ITEMS)
  save(STORAGE_KEYS.activityCenter, next)
  return nextItem
}

export function updateActivityReadState(id: string, read: boolean): void {
  const next = loadActivityCenter().map((item) => item.id === id
    ? { ...item, unread: !read, readAt: read ? nowIso() : null }
    : item)
  save(STORAGE_KEYS.activityCenter, next)
}

export function archiveActivity(id: string): void {
  const next = loadActivityCenter().map((item) => item.id === id ? { ...item, archived: true, unread: false } : item)
  save(STORAGE_KEYS.activityCenter, next)
}

export function loadShareState(): ShareStateItem {
  if (!canUseStorage()) return { state: 'idle', updatedAt: nowIso(), lastTarget: null }
  return safeParse(window.localStorage.getItem(STORAGE_KEYS.shareState), { state: 'idle', updatedAt: nowIso(), lastTarget: null })
}

export function setShareState(state: ShareState, target?: ShareTargetState | null): ShareStateItem {
  const next: ShareStateItem = {
    state,
    lastTarget: target ?? loadShareState().lastTarget,
    updatedAt: nowIso(),
  }
  save(STORAGE_KEYS.shareState, next)
  return next
}

export function resolveGuestPersistenceState(userId?: string | null): GuestPersistenceState {
  if (userId) return 'pending_merge'
  if (!canUseStorage()) return 'none'
  const hasLocal = Boolean(window.localStorage.getItem('creava.personalization.favorites'))
    || Boolean(window.localStorage.getItem('creava.personalization.history'))
  return hasLocal ? 'local_only' : 'none'
}

export function setGuestPersistenceState(state: GuestPersistenceState): void {
  save(STORAGE_KEYS.guestPersistence, { state, updatedAt: nowIso() })
}

export function loadSyncState(): SyncState {
  if (!canUseStorage()) return 'idle'
  const raw = safeParse<{ state: SyncState } | null>(window.localStorage.getItem(STORAGE_KEYS.syncState), null)
  return raw?.state ?? 'idle'
}

export function setSyncState(state: SyncState): void {
  save(STORAGE_KEYS.syncState, { state, updatedAt: nowIso() })
}

export function deriveFavoriteState(item: FavoriteItem): FavoriteState {
  if (item.syncState === 'sync_failed') return 'sync_failed'
  if (item.syncState === 'sync_pending') return 'sync_pending'
  return 'favorited'
}

export function toSavedCollectionState(favorites: FavoriteItem[], recents: ViewHistoryItem[]): SavedCollectionState {
  return {
    favorites,
    recents,
    continueJourneys: loadContinueJourney(),
  }
}

export function deriveRecommendationHookState(collection: SavedCollectionState, userId?: string | null): RecommendationHookState {
  const favoriteKinds = [...new Set(collection.favorites.map((item) => item.kind))]
  const recentKinds = [...new Set(collection.recents.map((item) => item.kind))]
  const supportViews = collection.recents.filter((item) => item.kind === 'faq' || item.kind === 'guide').length

  return {
    favoriteKinds,
    recentKinds,
    supportAffinityState: supportViews >= 4 ? 'high_intent' : supportViews >= 1 ? 'guide' : 'none',
    membershipAffinityState: userId ? 'member_active' : favoriteKinds.includes('fanclub') ? 'member_candidate' : 'guest',
    contentAffinityState: collection.recents.length >= 10 ? 'high' : collection.recents.length >= 4 ? 'medium' : 'low',
  }
}

export async function shareEntity(target: ShareTargetState): Promise<ShareState> {
  if (target.visibilityState !== 'public') {
    setShareState('blocked', target)
    return 'blocked'
  }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ url: target.href, title: target.title })
      setShareState('shared', target)
      return 'shared'
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(target.href)
      setShareState('copied', target)
      return 'copied'
    }

    setShareState('failed', target)
    return 'failed'
  } catch {
    setShareState('failed', target)
    return 'failed'
  }
}
