import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHead from '@/components/seo/PageHead'
import ErrorState from '@/components/common/ErrorState'
import { ROUTES } from '@/lib/routeConstants'
import { isFanclubSite, isStoreSite } from '@/lib/siteLinks'
import { trackMizzzEvent } from '@/modules/analytics/tracking'
import { searchDiscovery } from '@/modules/discovery/api'
import { rankByBehavior, resolveContentTypeLabel } from '@/modules/discovery/lib'
import type { DiscoveryContentType, DiscoveryItem, DiscoverySourceSite } from '@/modules/discovery/types'
import { loadFavorites, loadNotifications, loadViewHistory } from '@/modules/personalization/storage'

const CONTENT_TYPES: DiscoveryContentType[] = ['all', 'product', 'news', 'event', 'fanclub', 'faq', 'guide', 'blog']
const SOURCE_SITES: DiscoverySourceSite[] = ['all', 'main', 'store', 'fc']

function detectSourceSite(): DiscoverySourceSite {
  if (isStoreSite) return 'store'
  if (isFanclubSite) return 'fc'
  return 'main'
}

export default function DiscoveryPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<DiscoveryItem[]>([])
  const [fallbacks, setFallbacks] = useState<Array<{ title: string; path: string; contentType: string }>>([])

  const q = searchParams.get('q') ?? ''
  const sourceSite = (searchParams.get('sourceSite') as DiscoverySourceSite) || detectSourceSite()
  const contentType = (searchParams.get('contentType') as DiscoveryContentType) || 'all'
  const sort = (searchParams.get('sort') as 'relevance' | 'updated') || 'relevance'
  const category = searchParams.get('category') ?? ''
  const memberState = searchParams.get('memberState') === 'member' ? 'member' : 'guest'

  const behaviorContext = useMemo(() => ({
    favorites: loadFavorites(),
    history: loadViewHistory(),
    notifications: loadNotifications(),
  }), [])

  useEffect(() => {
    trackMizzzEvent('search_open', { sourceSite, pageType: 'discovery', locale: i18n.language })
  }, [i18n.language, sourceSite])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    searchDiscovery({
      q,
      sourceSite,
      contentType,
      category,
      locale: (i18n.language.startsWith('ko') ? 'ko' : i18n.language.startsWith('en') ? 'en' : 'ja'),
      sort,
      memberState,
      limit: 40,
    })
      .then((res) => {
        if (cancelled) return
        const ranked = rankByBehavior(res.items, behaviorContext.favorites, behaviorContext.history, behaviorContext.notifications)
        setItems(ranked)
        setFallbacks(res.recommendations?.noResultFallback ?? [])
        trackMizzzEvent('search_submit', {
          sourceSite,
          contentType,
          locale: i18n.language,
          category: category || 'all',
          resultCount: ranked.length,
        })
        if (ranked.length === 0) {
          trackMizzzEvent('search_no_result', { sourceSite, contentType, locale: i18n.language, qLength: q.length })
        }
      })
      .catch(() => {
        if (cancelled) return
        setError(t('discovery.error', { defaultValue: '検索結果の取得に失敗しました。時間をおいて再試行してください。' }))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [behaviorContext.favorites, behaviorContext.history, behaviorContext.notifications, category, contentType, i18n.language, memberState, q, sort, sourceSite, t])

  const recommendedFromHistory = useMemo(
    () => behaviorContext.history.slice(0, 4).map((item) => ({ title: item.title, href: item.href, sourceSite: item.sourceSite })),
    [behaviorContext.history],
  )

  const recommendedFromFavorites = useMemo(
    () => behaviorContext.favorites.slice(0, 4).map((item) => ({ title: item.title, href: item.href, sourceSite: item.sourceSite })),
    [behaviorContext.favorites],
  )

  const recommendedFromNotifications = useMemo(
    () => behaviorContext.notifications.filter((item) => !item.isRead).slice(0, 4).map((item) => ({ title: item.title, href: item.href || ROUTES.MEMBER, sourceSite: item.sourceSite })),
    [behaviorContext.notifications],
  )

  function updateQuery(next: Partial<Record<'q' | 'sourceSite' | 'contentType' | 'sort' | 'category' | 'memberState', string>>) {
    const updated = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(next)) {
      if (!value) updated.delete(key)
      else updated.set(key, value)
    }
    setSearchParams(updated, { replace: true })
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
      <PageHead title={t('discovery.title', { defaultValue: '横断検索' })} description={t('discovery.description', { defaultValue: 'main / store / fanclub / support を横断して検索できます。' })} />

      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">cross discovery</p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('discovery.title', { defaultValue: '横断検索' })}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('discovery.lead', { defaultValue: '商品 / FAQ / Guide / News / Event / FCコンテンツを横断検索し、次の行動までつなぎます。' })}</p>
      </header>

      <div className="mt-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <input
          type="search"
          value={q}
          onChange={(event) => updateQuery({ q: event.target.value })}
          placeholder={t('discovery.searchPlaceholder', { defaultValue: '知りたい内容を入力（例: 配送、限定、チケット）' })}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none ring-violet-400 focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-gray-500 dark:text-gray-400">{t('discovery.filterSource', { defaultValue: 'サイト' })}
            <select value={sourceSite} onChange={(event) => { updateQuery({ sourceSite: event.target.value }); trackMizzzEvent('filter_apply', { filterType: 'sourceSite', value: event.target.value }) }} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              {SOURCE_SITES.map((site) => <option key={site} value={site}>{site}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">{t('discovery.filterType', { defaultValue: '種別' })}
            <select value={contentType} onChange={(event) => { updateQuery({ contentType: event.target.value }); trackMizzzEvent('filter_apply', { filterType: 'contentType', value: event.target.value }) }} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">{t('discovery.filterSort', { defaultValue: '並び順' })}
            <select value={sort} onChange={(event) => { updateQuery({ sort: event.target.value }); trackMizzzEvent('sort_apply', { value: event.target.value }) }} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              <option value="relevance">{t('discovery.sortRelevance', { defaultValue: '関連度順' })}</option>
              <option value="updated">{t('discovery.sortUpdated', { defaultValue: '更新日順' })}</option>
            </select>
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">{t('discovery.filterMember', { defaultValue: '表示範囲' })}
            <select value={memberState} onChange={(event) => updateQuery({ memberState: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              <option value="guest">{t('discovery.memberGuest', { defaultValue: '公開のみ' })}</option>
              <option value="member">{t('discovery.memberMember', { defaultValue: '会員向け含む' })}</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="mt-6"><ErrorState message={error} location="discovery_search" /></div>}
      {loading && <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">{t('common.loading', { defaultValue: '読み込み中...' })}</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('discovery.resultCount', { defaultValue: '{{count}} 件の結果', count: items.length })}</p>
            <button type="button" className="text-xs text-violet-600 hover:text-violet-500 dark:text-violet-300" onClick={() => setSearchParams({ sourceSite: detectSourceSite(), contentType: 'all', sort: 'relevance', memberState: 'guest' })}>
              {t('discovery.reset', { defaultValue: '条件リセット' })}
            </button>
          </div>

          {items.length > 0 && (
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <span className="rounded-full border border-gray-200 px-2 py-1 dark:border-gray-700">{resolveContentTypeLabel(item.contentType)}</span>
                    <span className="rounded-full border border-gray-200 px-2 py-1 dark:border-gray-700">{item.sourceSite}</span>
                    {item.requiresAuth && <span className="rounded-full border border-violet-300 px-2 py-1 text-violet-700 dark:border-violet-700 dark:text-violet-300">Auth</span>}
                  </div>
                  <Link to={item.path} className="mt-3 block text-lg font-semibold text-gray-900 hover:text-violet-600 dark:text-gray-100 dark:hover:text-violet-300" onClick={() => trackMizzzEvent('search_result_click', { sourceSite, contentType: item.contentType, destination: item.path })}>
                    {item.title}
                  </Link>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.summary}</p>
                  {item.related.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.related.map((related, index) => (
                        <Link key={`${item.id}-${index}`} to={related.href} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-violet-400 hover:text-violet-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-violet-600" onClick={() => trackMizzzEvent('related_content_click', { sourceSite: item.sourceSite, contentType: item.contentType, relatedType: related.contentType })}>
                          {related.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {items.length === 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/60 dark:bg-amber-950/10">
              <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">{t('discovery.noResultTitle', { defaultValue: '検索結果がありません' })}</h2>
              <p className="mt-2 text-sm text-amber-800/90 dark:text-amber-300/80">{t('discovery.noResultDescription', { defaultValue: '条件をゆるめるか、以下の発見導線から次のアクションを選んでください。' })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fallbacks.map((item) => (
                  <Link key={item.path} to={item.path} className="rounded-full border border-amber-300 px-3 py-1 text-xs text-amber-900 dark:border-amber-700 dark:text-amber-200">{item.title}</Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('discovery.recentHistory', { defaultValue: '最近見たコンテンツ' })}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {recommendedFromHistory.length > 0 ? recommendedFromHistory.map((item) => (
                  <li key={`history-${item.href}`}>
                    <Link to={item.href} className="text-gray-700 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-300" onClick={() => trackMizzzEvent('recent_history_click', { sourceSite: item.sourceSite })}>{item.title}</Link>
                  </li>
                )) : <li className="text-gray-500 dark:text-gray-400">{t('discovery.noHistory', { defaultValue: '閲覧履歴がまだありません。' })}</li>}
              </ul>
            </section>
            <section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('discovery.favoriteBase', { defaultValue: 'お気に入りから再発見' })}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {recommendedFromFavorites.length > 0 ? recommendedFromFavorites.map((item) => (
                  <li key={`fav-${item.href}`}>
                    <Link to={item.href} className="text-gray-700 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-300" onClick={() => trackMizzzEvent('favorite_based_click', { sourceSite: item.sourceSite })}>{item.title}</Link>
                  </li>
                )) : <li className="text-gray-500 dark:text-gray-400">{t('discovery.noFavorite', { defaultValue: 'お気に入り登録からおすすめを生成します。' })}</li>}
              </ul>
            </section>
            <section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('discovery.notificationBase', { defaultValue: '通知からの導線' })}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {recommendedFromNotifications.length > 0 ? recommendedFromNotifications.map((item) => (
                  <li key={`notice-${item.href}`}>
                    <Link to={item.href} className="text-gray-700 hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-300" onClick={() => trackMizzzEvent('notification_based_click', { sourceSite: item.sourceSite })}>{item.title}</Link>
                  </li>
                )) : <li className="text-gray-500 dark:text-gray-400">{t('discovery.noNotification', { defaultValue: '未読通知はありません。' })}</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
