import { trackMizzzEvent } from '@/modules/analytics/tracking'

export type ArticleState = 'draft' | 'review_pending' | 'published' | 'outdated' | 'archived'
export type ArticleVisibilityState = 'public' | 'members_only' | 'support_only' | 'internal_only'
export type SearchResultState = 'results_found' | 'low_confidence' | 'no_results' | 'ambiguous'
export type DeflectionState = 'not_attempted' | 'article_viewed' | 'article_helpful' | 'self_resolved' | 'still_need_support'
export type KnownIssueState = 'none' | 'suspected' | 'confirmed' | 'published' | 'resolved' | 'archived'
export type KnowledgeGapState = 'none' | 'suspected' | 'confirmed' | 'article_needed' | 'article_update_needed'

export interface KnowledgeSearchLogPayload {
  sourceSite: 'main' | 'store' | 'fc'
  query: string
  resultCount: number
  category?: string
}

export interface KnowledgeArticleEventPayload {
  sourceSite: 'main' | 'store' | 'fc'
  articleType: 'faq' | 'guide' | 'known_issue'
  articleSlug: string
  category?: string
  visibility?: ArticleVisibilityState
}

export function resolveSearchResultState(resultCount: number, query: string): SearchResultState {
  if (!query.trim()) return 'ambiguous'
  if (resultCount <= 0) return 'no_results'
  if (resultCount <= 2) return 'low_confidence'
  return 'results_found'
}

export function trackKnowledgeSearch(payload: KnowledgeSearchLogPayload): SearchResultState {
  const state = resolveSearchResultState(payload.resultCount, payload.query)
  trackMizzzEvent('help_search_query', {
    sourceSite: payload.sourceSite,
    queryLength: payload.query.trim().length,
    resultCount: payload.resultCount,
    supportCaseType: payload.category ?? 'all',
    searchResultState: state,
  })
  if (state === 'no_results') {
    trackMizzzEvent('help_search_no_result', {
      sourceSite: payload.sourceSite,
      queryLength: payload.query.trim().length,
      supportCaseType: payload.category ?? 'all',
      searchResultState: state,
    })
  }
  return state
}

export function trackKnowledgeArticleView(payload: KnowledgeArticleEventPayload): void {
  trackMizzzEvent('help_article_view', {
    sourceSite: payload.sourceSite,
    articleType: payload.articleType,
    articleSlug: payload.articleSlug,
    supportCaseType: payload.category ?? 'general',
    articleVisibilityState: payload.visibility ?? 'public',
  })
}

export function trackKnowledgeFeedback(payload: KnowledgeArticleEventPayload & { feedbackState: 'helpful' | 'not_helpful' }): void {
  trackMizzzEvent('help_article_feedback', {
    sourceSite: payload.sourceSite,
    articleType: payload.articleType,
    articleSlug: payload.articleSlug,
    supportCaseType: payload.category ?? 'general',
    feedbackState: payload.feedbackState,
  })
}

export function trackDeflectionState(payload: {
  sourceSite: 'main' | 'store' | 'fc'
  deflectionState: DeflectionState
  articleType?: 'faq' | 'guide' | 'known_issue'
  category?: string
}): void {
  trackMizzzEvent('self_service_deflection', {
    sourceSite: payload.sourceSite,
    deflectionState: payload.deflectionState,
    articleType: payload.articleType ?? 'guide',
    supportCaseType: payload.category ?? 'general',
  })
}
