import { useCallback, useMemo, useState } from 'react'
import { trackMizzzEvent } from '@/modules/analytics/tracking'
import { loadFavorites, loadViewHistory, toggleFavorite, trackView } from '../storage'
import {
  archiveActivity,
  deriveRecommendationHookState,
  loadActivityCenter,
  loadContinueJourney,
  loadShareState,
  loadSyncState,
  resolveGuestPersistenceState,
  setGuestPersistenceState,
  setSyncState,
  shareEntity,
  toSavedCollectionState,
  updateActivityReadState,
  upsertContinueJourney,
  pushActivity,
} from '../savedState'
import type { PersonalizationEntityRef, ShareTargetState } from '../types'

export function useEngagementCenter(userId?: string | null) {
  const [favorites, setFavorites] = useState(loadFavorites)
  const [recents, setRecents] = useState(loadViewHistory)
  const [continueJourneys, setContinueJourneys] = useState(loadContinueJourney)
  const [activities, setActivities] = useState(loadActivityCenter)
  const [shareState, setShareState] = useState(loadShareState)
  const [syncState, setSync] = useState(loadSyncState)
  const [guestPersistenceState, setGuestPersistence] = useState(resolveGuestPersistenceState(userId))

  const refresh = useCallback(() => {
    setFavorites(loadFavorites())
    setRecents(loadViewHistory())
    setContinueJourneys(loadContinueJourney())
    setActivities(loadActivityCenter())
    setShareState(loadShareState())
    setSync(loadSyncState())
    setGuestPersistence(resolveGuestPersistenceState(userId))
  }, [userId])

  const toggleFavoriteItem = useCallback((input: PersonalizationEntityRef) => {
    const result = toggleFavorite(input, userId)
    setSyncState(userId ? 'sync_pending' : 'idle')
    pushActivity({
      type: 'favorite',
      title: result.active ? 'お気に入りに追加しました' : 'お気に入りを解除しました',
      body: input.title,
      href: input.href,
      sourceSite: input.sourceSite,
      entityKind: input.kind,
      savedStateTraceId: `fav_${input.kind}_${input.slug}`,
    })
    trackMizzzEvent(result.active ? 'content_favorite_add' : 'product_favorite_remove', {
      sourceSite: input.sourceSite,
      contentType: input.kind,
      entitySlug: input.slug,
      syncState: userId ? 'pending' : 'local_only',
    })
    refresh()
    return result
  }, [refresh, userId])

  const trackViewItem = useCallback((input: PersonalizationEntityRef) => {
    trackView(input, userId)
    const continueState = upsertContinueJourney(input, 'resumable')
    pushActivity({
      type: 'recent',
      title: '最近見た項目を更新しました',
      body: input.title,
      href: input.href,
      sourceSite: input.sourceSite,
      entityKind: input.kind,
      savedStateTraceId: `recent_${input.kind}_${input.slug}`,
    })
    trackMizzzEvent('history_viewed', {
      sourceSite: input.sourceSite,
      contentType: input.kind,
      entitySlug: input.slug,
      continueJourneyState: continueState.continueJourneyState,
    })
    refresh()
  }, [refresh, userId])

  const resumeJourney = useCallback((input: PersonalizationEntityRef) => {
    const next = upsertContinueJourney(input, 'in_progress')
    pushActivity({
      type: 'continue',
      title: '続きから再開しました',
      body: input.title,
      href: input.href,
      sourceSite: input.sourceSite,
      entityKind: input.kind,
      savedStateTraceId: `resume_${input.kind}_${input.slug}`,
    })
    trackMizzzEvent('favorite_based_revisit', {
      sourceSite: input.sourceSite,
      contentType: input.kind,
      entitySlug: input.slug,
      continueJourneyState: next.continueJourneyState,
    })
    refresh()
  }, [refresh])

  const markActivity = useCallback((id: string, read: boolean) => {
    updateActivityReadState(id, read)
    refresh()
  }, [refresh])

  const archiveActivityItem = useCallback((id: string) => {
    archiveActivity(id)
    refresh()
  }, [refresh])

  const share = useCallback(async (target: ShareTargetState) => {
    const status = await shareEntity(target)
    pushActivity({
      type: 'share',
      title: status === 'blocked' ? '共有できない項目です' : '共有ステータスを更新しました',
      body: target.title,
      href: target.href,
      sourceSite: 'main',
      savedStateTraceId: `share_${target.href}`,
    })
    trackMizzzEvent(status === 'failed' ? 'support_cta_click' : 'cta_click', {
      cta: 'share',
      shareState: status,
      visibilityState: target.visibilityState,
    })
    refresh()
    return status
  }, [refresh])

  const simulateGuestMerge = useCallback(() => {
    if (!userId) return
    setGuestPersistenceState('merged')
    setSyncState('synced')
    setGuestPersistenceState('merged')
    refresh()
  }, [refresh, userId])

  const recommendationHook = useMemo(() => {
    const collection = toSavedCollectionState(favorites, recents)
    return deriveRecommendationHookState(collection, userId)
  }, [favorites, recents, userId])

  const unreadActivityCount = useMemo(() => activities.filter((item) => item.unread && !item.archived).length, [activities])

  return {
    favorites,
    recents,
    continueJourneys,
    activities,
    shareState,
    syncState,
    guestPersistenceState,
    unreadActivityCount,
    recommendationHook,
    toggleFavoriteItem,
    trackViewItem,
    resumeJourney,
    markActivity,
    archiveActivityItem,
    share,
    simulateGuestMerge,
  }
}
