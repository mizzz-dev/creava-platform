import type { GuideItem, FAQItem, SourceSite } from '@/types'
import type { PublicStatusResponse } from '@/modules/status/api'
import type { HelpKnowledgeCandidate } from '@/modules/support/conversationalHelp'

export type RecommendationState = 'not_evaluated' | 'eligible' | 'shown' | 'clicked' | 'dismissed' | 'suppressed'
export type RecommendationScoreState = 'low' | 'medium' | 'high'
export type IssueSignalState = 'none' | 'weak_signal' | 'likely_issue' | 'repeated_issue' | 'known_issue_match' | 'escalation_risk'
export type InterventionState = 'not_triggered' | 'triggered' | 'viewed' | 'engaged' | 'completed' | 'handed_off'
export type InterventionTriggerState = 'page_view' | 'search_pattern' | 'known_issue' | 'member_state' | 'handoff_pattern' | 'manual'
export type InterventionPlacementState = 'inline' | 'banner' | 'modal_like' | 'help_widget' | 'assistant_entry'
export type PreventionOutcomeState = 'unknown' | 'self_resolved' | 'partially_resolved' | 'still_need_support' | 'handed_off_to_human'
export type UserContextState = 'guest' | 'authenticated' | 'member' | 'grace' | 'expired' | 'high_risk_journey'
export type LifecycleContextState = 'guest' | 'active' | 'grace' | 'expired' | 'dormant' | 'new_member' | 'unknown'
export type SourceSiteContextState = 'main' | 'store' | 'fc'

export interface ProactiveSupportSummary {
  proactiveSupportSummary: string
  recommendationState: RecommendationState
  recommendationScoreState: RecommendationScoreState
  issueSignalState: IssueSignalState
  issueSignalReason: string
  interventionState: InterventionState
  interventionTriggerState: InterventionTriggerState
  interventionPlacementState: InterventionPlacementState
  preventionOutcomeState: PreventionOutcomeState
  userContextState: UserContextState
  lifecycleContextState: LifecycleContextState
  sourceSiteContextState: SourceSiteContextState
  recommendationLastShownAt?: string
  recommendationLastClickedAt?: string
  interventionLastCompletedAt?: string
  interventionLastHandedOffAt?: string
}

export interface ProactiveRecommendation {
  id: string
  title: string
  description: string
  ctaLabel: string
  ctaTo: string
  recommendationType: 'article' | 'known_issue' | 'troubleshooting' | 'assistant' | 'handoff'
  recommendationScoreState: RecommendationScoreState
}

function normalizeLifecycleState(value: unknown): LifecycleContextState {
  const raw = String(value ?? '').toLowerCase()
  if (raw === 'guest' || raw === 'active' || raw === 'grace' || raw === 'expired' || raw === 'dormant' || raw === 'new_member') return raw
  return 'unknown'
}

function resolveUserContext(params: { isSignedIn: boolean; membershipStatus?: string; lifecycleStage?: string }): UserContextState {
  const membership = String(params.membershipStatus ?? '').toLowerCase()
  if (!params.isSignedIn) return 'guest'
  if (membership.includes('grace')) return 'grace'
  if (membership.includes('expired')) return 'expired'
  if (membership.includes('member') || membership.includes('active')) return 'member'
  if (params.lifecycleStage === 'dormant' || params.lifecycleStage === 'churn_risk') return 'high_risk_journey'
  return 'authenticated'
}

function scoreToState(score: number): RecommendationScoreState {
  if (score >= 75) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function evaluateProactiveSupport(params: {
  sourceSite: SourceSite
  category: string
  search: string
  faqs: FAQItem[]
  guides: GuideItem[]
  candidates: HelpKnowledgeCandidate[]
  statusSummary: PublicStatusResponse | null
  isSignedIn: boolean
  membershipStatus?: string
  lifecycleStage?: string
}): ProactiveSupportSummary {
  const sourceSite = params.sourceSite === 'all' ? 'main' : params.sourceSite
  const searchLength = params.search.trim().length
  const hasKnownIssue = params.candidates.some((candidate) => candidate.type === 'known_issue')
  const hasResults = params.candidates.length > 0
  const repeatedLikeSignal = searchLength >= 8 && !hasResults
  const issueSignalState: IssueSignalState = hasKnownIssue
    ? 'known_issue_match'
    : repeatedLikeSignal
      ? 'likely_issue'
      : searchLength >= 4
        ? 'weak_signal'
        : 'none'

  const riskBonus = hasKnownIssue ? 45 : repeatedLikeSignal ? 30 : 10
  const signedInBonus = params.isSignedIn ? 10 : 0
  const categoryBonus = params.category !== 'all' ? 10 : 0
  const lowResultPenalty = hasResults ? 15 : 0
  const score = Math.max(0, Math.min(100, riskBonus + signedInBonus + categoryBonus + lowResultPenalty))
  const recommendationScoreState = scoreToState(score)

  const userContextState = resolveUserContext({
    isSignedIn: params.isSignedIn,
    membershipStatus: params.membershipStatus,
    lifecycleStage: params.lifecycleStage,
  })

  const lifecycleContextState = normalizeLifecycleState(params.lifecycleStage)
  const interventionTriggerState: InterventionTriggerState = hasKnownIssue
    ? 'known_issue'
    : searchLength >= 2
      ? 'search_pattern'
      : 'page_view'

  return {
    proactiveSupportSummary: hasKnownIssue
      ? '既知の問題と一致したため先回り案内を強化'
      : hasResults
        ? '閲覧文脈に一致するヘルプ候補を先回り提示'
        : '検索結果不足のためトラブルシューティングと有人引き継ぎを補助',
    recommendationState: score >= 40 ? 'eligible' : 'suppressed',
    recommendationScoreState,
    issueSignalState,
    issueSignalReason: hasKnownIssue ? 'known_issue_match' : repeatedLikeSignal ? 'search_with_low_result' : 'baseline_context',
    interventionState: score >= 40 ? 'triggered' : 'not_triggered',
    interventionTriggerState,
    interventionPlacementState: searchLength > 0 ? 'inline' : 'help_widget',
    preventionOutcomeState: 'unknown',
    userContextState,
    lifecycleContextState,
    sourceSiteContextState: sourceSite,
  }
}

export function buildProactiveRecommendations(params: {
  sourceSite: SourceSite
  summary: ProactiveSupportSummary
  candidates: HelpKnowledgeCandidate[]
  category: string
  inquiryPath: string
}): ProactiveRecommendation[] {
  if (params.summary.recommendationState === 'suppressed') return []

  const firstArticle = params.candidates[0]
  const knownIssue = params.candidates.find((candidate) => candidate.type === 'known_issue')
  const supportType = params.category === 'all' ? 'general' : params.category

  const recommendations: ProactiveRecommendation[] = []

  if (knownIssue) {
    recommendations.push({
      id: `known-${knownIssue.id}`,
      title: `既知の問題: ${knownIssue.title}`,
      description: knownIssue.summary || '現在確認されている既知の問題の最新状況を確認できます。',
      ctaLabel: 'ステータスを確認',
      ctaTo: '/status',
      recommendationType: 'known_issue',
      recommendationScoreState: params.summary.recommendationScoreState,
    })
  }

  if (firstArticle) {
    recommendations.push({
      id: `article-${firstArticle.id}`,
      title: firstArticle.title,
      description: `カテゴリ: ${firstArticle.category || supportType}`,
      ctaLabel: '案内を開く',
      ctaTo: firstArticle.slug,
      recommendationType: firstArticle.type === 'known_issue' ? 'known_issue' : 'article',
      recommendationScoreState: params.summary.recommendationScoreState,
    })
  }

  recommendations.push({
    id: 'troubleshooting-flow',
    title: 'ガイド付きトラブルシューティングを試す',
    description: '状況整理と再現手順を短いステップで確認します。',
    ctaLabel: '会話型ヘルプを使う',
    ctaTo: '#conversational-help-assistant',
    recommendationType: 'assistant',
    recommendationScoreState: params.summary.recommendationScoreState,
  })

  recommendations.push({
    id: 'handoff',
    title: '解決しない場合はサポートへ引き継ぐ',
    description: '閲覧済み記事と試行内容を引き継いで問い合わせできます。',
    ctaLabel: '問い合わせに進む',
    ctaTo: params.inquiryPath,
    recommendationType: 'handoff',
    recommendationScoreState: params.summary.recommendationScoreState,
  })

  return recommendations.slice(0, 4)
}
