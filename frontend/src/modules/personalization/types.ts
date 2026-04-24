export type PersonalizationSourceSite = 'main' | 'store' | 'fc'

export type PersonalizationEntityKind =
  | 'product'
  | 'fanclub'
  | 'news'
  | 'blog'
  | 'event'
  | 'guide'
  | 'faq'

export type VisibilityState = 'public' | 'member_only' | 'private'

export interface PersonalizationEntityRef {
  kind: PersonalizationEntityKind
  slug: string
  title: string
  href: string
  sourceSite: PersonalizationSourceSite
  locale?: string | null
  visibilityState?: VisibilityState
}

export type FavoriteState = 'not_favorited' | 'favorited' | 'removed' | 'sync_pending' | 'sync_failed'
export type BookmarkState = 'none' | 'saved' | 'removed'
export type RecentViewState = 'not_seen' | 'seen_once' | 'revisited' | 'expired' | 'cleared'
export type ContinueJourneyState = 'none' | 'resumable' | 'in_progress' | 'completed' | 'dismissed'
export type ActivityCenterState = 'empty' | 'unread' | 'read' | 'archived'
export type ShareState = 'idle' | 'copied' | 'shared' | 'failed' | 'blocked'
export type GuestPersistenceState = 'none' | 'local_only' | 'pending_merge' | 'merged' | 'discarded'
export type SyncState = 'idle' | 'sync_pending' | 'synced' | 'sync_failed'

export interface FavoriteItem extends PersonalizationEntityRef {
  id: string
  createdAt: string
  updatedAt: string
  userId?: string | null
  favoriteState?: FavoriteState
  syncState?: SyncState
}

export interface ViewHistoryItem extends PersonalizationEntityRef {
  id: string
  viewedAt: string
  userId?: string | null
  recentViewState?: RecentViewState
}

export interface ContinueJourneyItem extends PersonalizationEntityRef {
  id: string
  continueJourneyState: ContinueJourneyState
  resumedAt?: string | null
  updatedAt: string
}

export interface ActivityItemState {
  id: string
  type: 'favorite' | 'recent' | 'continue' | 'support' | 'share'
  title: string
  body: string
  href?: string | null
  sourceSite: PersonalizationSourceSite
  entityKind?: PersonalizationEntityKind
  unread: boolean
  archived: boolean
  createdAt: string
  readAt?: string | null
  savedStateTraceId: string
}

export interface ShareTargetState {
  href: string
  title: string
  visibilityState: VisibilityState
}

export interface ShareStateItem {
  state: ShareState
  lastTarget?: ShareTargetState | null
  updatedAt: string
}

export interface SavedCollectionState {
  favorites: FavoriteItem[]
  recents: ViewHistoryItem[]
  continueJourneys: ContinueJourneyItem[]
}

export interface RecommendationHookState {
  favoriteKinds: PersonalizationEntityKind[]
  recentKinds: PersonalizationEntityKind[]
  supportAffinityState: 'none' | 'guide' | 'faq' | 'high_intent'
  membershipAffinityState: 'guest' | 'member_candidate' | 'member_active'
  contentAffinityState: 'low' | 'medium' | 'high'
}

export interface MemberNotificationItem {
  id: string
  type: MemberNotificationType
  priority: 'normal' | 'high'
  sourceSite: PersonalizationSourceSite
  category: string
  title: string
  body: string
  href?: string | null
  isRead: boolean
  createdAt: string
  readAt?: string | null
  userId?: string | null
}

export type MemberNotificationType =
  | 'fc_update'
  | 'member_benefit'
  | 'store_new_arrival'
  | 'featured_item'
  | 'event_update'
  | 'announcement'
  | 'system'
  | 'support'
  | 'mypage'
