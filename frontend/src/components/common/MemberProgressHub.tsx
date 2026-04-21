import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/hooks'
import { resolveMemberProgression } from '@/lib/auth/memberProgression'
import { ROUTES } from '@/lib/routeConstants'
import { trackMizzzEvent } from '@/modules/analytics/tracking'

type SourceSite = 'main' | 'store' | 'fc' | 'member' | 'support' | 'admin'

export default function MemberProgressHub({ sourceSite }: { sourceSite: SourceSite }) {
  const { t } = useTranslation()
  const { user, lifecycle } = useCurrentUser()
  const progress = resolveMemberProgression({ user, lifecycle, sourceSite })

  useEffect(() => {
    trackMizzzEvent('progress_hub_view', {
      sourceSite,
      lifecycleStage: progress.lifecycleStage,
      membershipStatus: progress.membershipStatus,
      entitlementState: progress.entitlementState,
      memberRankState: progress.memberRankState,
      missionState: progress.missionState,
      perkState: progress.perkState,
    })
    trackMizzzEvent('member_rank_view', {
      sourceSite,
      membershipStatus: progress.membershipStatus,
      memberRankState: progress.memberRankState,
      rankTier: progress.rankTier,
    })
    trackMizzzEvent('next_unlock_hint_view', {
      sourceSite,
      memberRankState: progress.memberRankState,
      missionProgress: progress.missionProgress,
      nextUnlockHint: progress.nextUnlockHint,
    })
  }, [progress, sourceSite])

  return (
    <section className="rounded-2xl border border-indigo-200/70 bg-gradient-to-b from-indigo-50/70 to-white p-4 dark:border-indigo-900/60 dark:from-indigo-950/20 dark:to-gray-950">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('member.progressHubTitle', { defaultValue: '会員ランク / 進行ハブ' })}
        </h2>
        <span className="rounded-full border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-700 dark:border-indigo-800 dark:text-indigo-200">
          {progress.memberRankState}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{progress.nextUnlockHint}</p>

      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-indigo-100 bg-white/80 p-2 dark:border-indigo-900/50 dark:bg-gray-900/40">
          <dt className="text-[10px] text-gray-500">{t('member.progressBadge', { defaultValue: '継続バッジ' })}</dt>
          <dd className="text-xs font-medium text-gray-900 dark:text-gray-100">{progress.continuityBadge}</dd>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-white/80 p-2 dark:border-indigo-900/50 dark:bg-gray-900/40">
          <dt className="text-[10px] text-gray-500">{t('member.progressMission', { defaultValue: 'ミッション進行' })}</dt>
          <dd className="text-xs font-medium text-gray-900 dark:text-gray-100">{progress.missionProgress}%</dd>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-white/80 p-2 dark:border-indigo-900/50 dark:bg-gray-900/40">
          <dt className="text-[10px] text-gray-500">{t('member.progressPerk', { defaultValue: '特典段階' })}</dt>
          <dd className="text-xs font-medium text-gray-900 dark:text-gray-100">{progress.perkUnlockState}</dd>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-white/80 p-2 dark:border-indigo-900/50 dark:bg-gray-900/40">
          <dt className="text-[10px] text-gray-500">{t('member.progressMemberSince', { defaultValue: '会員継続' })}</dt>
          <dd className="text-xs font-medium text-gray-900 dark:text-gray-100">{progress.memberSinceLabel}</dd>
        </div>
      </dl>

      <ul className="mt-3 space-y-1">
        {progress.availableMissions.slice(0, 3).map((mission) => (
          <li key={mission.id} className="flex items-center justify-between rounded-lg border border-indigo-100 bg-white/80 px-2 py-1 text-xs dark:border-indigo-900/40 dark:bg-gray-900/40">
            <span>{mission.title}</span>
            <span className="text-indigo-600 dark:text-indigo-300">{mission.state}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to={ROUTES.MEMBER}
          onClick={() => trackMizzzEvent('member_rank_progress_view', { sourceSite, memberRankState: progress.memberRankState })}
          className="text-xs text-indigo-700 underline dark:text-indigo-300"
        >
          {t('member.openProgressHub', { defaultValue: '進行状況を開く' })}
        </Link>
        <Link
          to={ROUTES.FANCLUB}
          onClick={() => trackMizzzEvent('mission_list_view', { sourceSite, missionState: progress.missionState, missionProgress: progress.missionProgress })}
          className="text-xs text-indigo-700 underline dark:text-indigo-300"
        >
          {t('member.openMissionList', { defaultValue: 'ミッションを見る' })}
        </Link>
      </div>
    </section>
  )
}
