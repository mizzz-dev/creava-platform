import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/hooks'
import { useEngagementCenter } from '../hooks/useEngagementCenter'
import type { PersonalizationEntityRef, PersonalizationSourceSite } from '../types'

interface Props {
  sourceSite: PersonalizationSourceSite
  className?: string
}

export default function EngagementActivityCenter({ sourceSite, className = '' }: Props) {
  const { t } = useTranslation()
  const { user, isSignedIn } = useCurrentUser()
  const center = useEngagementCenter(user?.id)

  const continueItem = center.continueJourneys.find((item) => item.sourceSite === sourceSite && item.continueJourneyState !== 'dismissed')

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/50 ${className}`} aria-label={t('engagement.sectionLabel', { defaultValue: '再訪・保存・共有センター' })}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('engagement.title', { defaultValue: '保存 / 最近見た / 続きから見る' })}</h2>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
          {t('engagement.unreadActivity', { count: center.unreadActivityCount, defaultValue: `未読アクティビティ ${center.unreadActivityCount} 件` })}
        </span>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('engagement.favoriteTitle', { defaultValue: 'お気に入り' })}</p>
          {center.favorites.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {center.favorites.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <Link className="truncate text-violet-700 underline dark:text-violet-300" to={item.href}>{item.title}</Link>
                  <button type="button" className="text-[10px] text-gray-500" onClick={() => center.share({ href: window.location.origin + item.href, title: item.title, visibilityState: item.visibilityState ?? 'public' })}>share</button>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('engagement.favoriteEmpty', { defaultValue: 'お気に入りはまだありません。' })}</p>}
        </article>

        <article className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('engagement.recentTitle', { defaultValue: '最近見た項目' })}</p>
          {center.recents.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {center.recents.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => center.resumeJourney(item as PersonalizationEntityRef)} className="text-left text-gray-700 underline dark:text-gray-300">
                    [{item.sourceSite}] {item.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('engagement.recentEmpty', { defaultValue: '最近見た項目はありません。' })}</p>}
        </article>
      </div>

      <div className="mt-3 rounded-xl border border-violet-200/80 bg-violet-50/70 p-3 text-xs text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200">
        <p className="font-medium">{t('engagement.continueTitle', { defaultValue: '続きから見る' })}</p>
        {continueItem ? (
          <Link to={continueItem.href} onClick={() => center.resumeJourney(continueItem)} className="mt-1 inline-flex text-violet-700 underline dark:text-violet-300">
            {continueItem.title}
          </Link>
        ) : (
          <p className="mt-1">{t('engagement.continueEmpty', { defaultValue: '再開可能な導線はまだありません。' })}</p>
        )}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <p className="rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-300">
          {t('engagement.guestPersistenceState', { defaultValue: 'ゲスト保存状態: {{state}}', state: center.guestPersistenceState })}
        </p>
        <p className="rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-300">
          {t('engagement.syncState', { defaultValue: '同期状態: {{state}}', state: center.syncState })}
        </p>
      </div>

      {!isSignedIn && (
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
          {t('engagement.loginHint', { defaultValue: 'ログインすると保存状態の同期対象になります（PIIは保存しません）。' })}
        </p>
      )}
    </section>
  )
}
