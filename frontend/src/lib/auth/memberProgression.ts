import type { AppUser } from '@/types'
import type { UserLifecycleSummary } from './lifecycle'

export type MemberRankState = 'none' | 'starter' | 'core' | 'premium' | 'legacy' | 'honorary'
export type RankTier = 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4'
export type RankProgressState = 'not_started' | 'in_progress' | 'ready_to_unlock' | 'capped'
export type StreakState = 'none' | 'active' | 'at_risk' | 'broken'
export type AchievementState = 'none' | 'unlocked' | 'highlighted' | 'archived'
export type MissionState = 'available' | 'in_progress' | 'completed' | 'expired' | 'hidden'
export type PerkUnlockState = 'locked' | 'eligible' | 'unlocked' | 'claimed' | 'expired'

export interface MemberProgressionSummary {
  membershipStatus: AppUser['membershipStatus']
  entitlementState: AppUser['entitlementState']
  lifecycleStage: UserLifecycleSummary['lifecycleStage'] | 'guest'
  loyaltyState: string
  memberRankState: MemberRankState
  rankTier: RankTier
  rankProgressState: RankProgressState
  streakState: StreakState
  achievementState: AchievementState
  missionState: MissionState
  missionProgress: number
  perkState: 'none' | 'teaser' | 'available' | 'expiring' | 'locked'
  perkEligibility: boolean
  perkUnlockState: PerkUnlockState
  benefitVisibilityState: 'hidden' | 'teaser' | 'visible' | 'emphasized'
  personalizationState: 'none' | 'basic' | 'member' | 'cross_site'
  activitySummaryState: 'low' | 'medium' | 'high'
  nextUnlockHint: string
  lastProgressUpdateAt: string | null
  memberSinceLabel: string
  continuityBadge: 'new_member' | 'steady' | 'comeback' | 'long_term' | 'grace_recovery'
  completedMissionCount: number
  availableMissions: Array<{ id: string; title: string; state: MissionState }>
}

const MISSION_DEFINITIONS: Array<{ id: string; title: string }> = [
  { id: 'fc-update', title: 'FCの最新更新をチェック' },
  { id: 'store-loop', title: 'StoreとFCを回遊する' },
  { id: 'notification-setup', title: '通知設定を整える' },
]

function toMonths(joinedAt: string | null): number {
  if (!joinedAt) return 0
  const start = new Date(joinedAt)
  if (Number.isNaN(start.getTime())) return 0
  const now = new Date()
  const years = now.getFullYear() - start.getFullYear()
  const months = now.getMonth() - start.getMonth()
  return Math.max(0, years * 12 + months)
}

function deriveRank(months: number, membershipStatus: AppUser['membershipStatus']): { state: MemberRankState; tier: RankTier } {
  if (membershipStatus !== 'member' && membershipStatus !== 'grace') return { state: 'none', tier: 'tier_0' }
  if (months >= 36) return { state: 'legacy', tier: 'tier_4' }
  if (months >= 18) return { state: 'premium', tier: 'tier_3' }
  if (months >= 8) return { state: 'core', tier: 'tier_2' }
  return { state: 'starter', tier: 'tier_1' }
}

export function resolveMemberProgression(params: {
  user: AppUser | null
  lifecycle: UserLifecycleSummary | null
  sourceSite: 'main' | 'store' | 'fc' | 'member' | 'support' | 'admin'
}): MemberProgressionSummary {
  const { user, lifecycle } = params
  if (!user || !lifecycle) {
    return {
      membershipStatus: 'non_member',
      entitlementState: 'inactive',
      lifecycleStage: 'guest',
      loyaltyState: 'new',
      memberRankState: 'none',
      rankTier: 'tier_0',
      rankProgressState: 'not_started',
      streakState: 'none',
      achievementState: 'none',
      missionState: 'available',
      missionProgress: 0,
      perkState: 'teaser',
      perkEligibility: false,
      perkUnlockState: 'locked',
      benefitVisibilityState: 'teaser',
      personalizationState: 'none',
      activitySummaryState: 'low',
      nextUnlockHint: 'ログインすると会員進行状況を確認できます。',
      lastProgressUpdateAt: null,
      memberSinceLabel: 'Member since -',
      continuityBadge: 'new_member',
      completedMissionCount: 0,
      availableMissions: MISSION_DEFINITIONS.map((mission) => ({ ...mission, state: 'available' })),
    }
  }

  const months = toMonths(lifecycle.joinedAt)
  const rank = deriveRank(months, user.membershipStatus)
  const missionProgress = user.membershipStatus === 'member' ? Math.min(100, Math.max(35, months * 5)) : user.membershipStatus === 'grace' ? 70 : 20
  const completedMissionCount = missionProgress >= 100 ? MISSION_DEFINITIONS.length : missionProgress >= 66 ? 2 : missionProgress >= 33 ? 1 : 0

  return {
    membershipStatus: user.membershipStatus,
    entitlementState: user.entitlementState,
    lifecycleStage: lifecycle.lifecycleStage,
    loyaltyState: rank.state === 'legacy' || rank.state === 'premium' ? 'loyal' : user.membershipStatus === 'member' ? 'active' : 'cold',
    memberRankState: rank.state,
    rankTier: rank.tier,
    rankProgressState: missionProgress >= 100 ? 'capped' : missionProgress >= 85 ? 'ready_to_unlock' : 'in_progress',
    streakState: user.membershipStatus === 'grace' ? 'at_risk' : user.membershipStatus === 'member' ? 'active' : 'none',
    achievementState: completedMissionCount >= 2 ? 'highlighted' : completedMissionCount >= 1 ? 'unlocked' : 'none',
    missionState: user.membershipStatus === 'canceled' || user.membershipStatus === 'expired' ? 'expired' : missionProgress >= 100 ? 'completed' : missionProgress > 0 ? 'in_progress' : 'available',
    missionProgress,
    perkState: user.membershipStatus === 'member' ? 'available' : user.membershipStatus === 'grace' ? 'expiring' : 'locked',
    perkEligibility: user.membershipStatus === 'member' || user.membershipStatus === 'grace',
    perkUnlockState: user.membershipStatus === 'member' ? 'unlocked' : user.membershipStatus === 'grace' ? 'eligible' : user.membershipStatus === 'expired' ? 'expired' : 'locked',
    benefitVisibilityState: user.membershipStatus === 'member' ? 'emphasized' : user.membershipStatus === 'grace' ? 'visible' : 'teaser',
    personalizationState: user.membershipStatus === 'member' ? 'cross_site' : 'basic',
    activitySummaryState: completedMissionCount >= 2 ? 'high' : completedMissionCount >= 1 ? 'medium' : 'low',
    nextUnlockHint: rank.state === 'legacy' ? '継続ありがとう。限定オファーと季節特典を優先表示しています。' : '次のランク解放まで、FC更新確認と通知設定を進めましょう。',
    lastProgressUpdateAt: lifecycle.statusUpdatedAt,
    memberSinceLabel: lifecycle.joinedAt ? `Member since ${new Date(lifecycle.joinedAt).getFullYear()}` : 'Member since -',
    continuityBadge: user.membershipStatus === 'grace' ? 'grace_recovery' : lifecycle.renewalState === 'reactivated' ? 'comeback' : months >= 18 ? 'long_term' : months >= 6 ? 'steady' : 'new_member',
    completedMissionCount,
    availableMissions: MISSION_DEFINITIONS.map((mission, index) => ({
      ...mission,
      state: completedMissionCount > index ? 'completed' : missionProgress > index * 33 ? 'in_progress' : 'available',
    })),
  }
}
