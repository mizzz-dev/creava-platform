import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import FanclubGuard from '@/components/guards/FanclubGuard'
import { useStrapiCollection, useContentAccess } from '@/hooks'
import { getFanclubList } from '@/modules/fanclub/api'
import { formatDate } from '@/utils'
import { detailPath, ROUTES } from '@/lib/routeConstants'
import { storeLink } from '@/lib/siteLinks'
import PageHead from '@/components/seo/PageHead'
import SkeletonListItem from '@/components/common/SkeletonListItem'
import type { FanclubContent } from '@/types'
import { getHistoryByKind, trackViewHistory } from '@/modules/store/lib/commerceOptimization'
import { trackEvent } from '@/modules/analytics'
import SectionReveal from '@/components/common/SectionReveal'

const CATEGORY_KEYS = ['all', 'diary', 'exclusive', 'qa', 'behind_scenes', 'teaser', 'live_archive', 'tips', 'info'] as const

type FanclubCategory = (typeof CATEGORY_KEYS)[number]

/* ── メンバー特典ブロック ──────────────────────────── */
const BENEFITS = [
  { icon: '✦', labelKey: 'fanclub.benefit.exclusive', color: 'text-violet-500 dark:text-violet-400' },
  { icon: '◈', labelKey: 'fanclub.benefit.earlyAccess', color: 'text-cyan-600 dark:text-cyan-400' },
  { icon: '⊹', labelKey: 'fanclub.benefit.storeDiscount', color: 'text-amber-600 dark:text-amber-400' },
  { icon: '❋', labelKey: 'fanclub.benefit.qanda', color: 'text-violet-500 dark:text-violet-400' },
] as const

export default function FanclubPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <PageHead title={t('nav.fanclub')} description={t('seo.fanclub')} noindex />

      {/* ── FCヒーロー ─────────────────────────────────── */}
      <section className="relative overflow-hidden fc-hero-surface">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(167,139,250,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_55%)]" />
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-[0.06]" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 会員バッジ */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
                members only
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[56px]">
              {t('nav.fanclub')}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-violet-100/75">
              {t('fanclub.pageLead', { defaultValue: '今週の更新・限定公開・会員向け導線をまとめて確認できます。' })}
            </p>

            {/* CTA行 */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={ROUTES.MEMBER}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {t('nav.member', { defaultValue: 'マイページ' })} →
              </Link>
              <Link
                to={storeLink(ROUTES.STORE)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm text-violet-100 backdrop-blur-sm transition-all hover:bg-white/12 hover:border-white/25"
              >
                {t('nav.store')} →
              </Link>
            </div>
          </motion.div>

          {/* 特典一覧 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {BENEFITS.map(({ icon, labelKey, color }) => (
              <div
                key={labelKey}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <span className={`text-xl ${color}`}>{icon}</span>
                <p className="mt-2 text-xs leading-relaxed text-violet-100/70">
                  {t(labelKey, { defaultValue: labelKey.split('.').pop() ?? '' })}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── コンテンツ本体 ─────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <FanclubGuard>
          <FanclubContentList />
        </FanclubGuard>
      </div>
    </div>
  )
}

/* ── コンテンツ一覧 ──────────────────────────────── */
function FanclubContentList() {
  const { t } = useTranslation()
  const { filterVisible } = useContentAccess()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FanclubCategory>('all')

  const { items, loading, error } = useStrapiCollection<FanclubContent>(
    () => getFanclubList({ pagination: { pageSize: 20 } }),
  )

  const visibleItems = items ? filterVisible(items) : null
  const recentSlugs = useMemo(() => new Set(getHistoryByKind('blog').slice(0, 10)), [])

  const filteredItems = useMemo(() => {
    if (!visibleItems) return []
    const q = query.trim().toLowerCase()
    return visibleItems.filter((item) => {
      const itemCategory = (item as FanclubContent & { category?: string }).category ?? 'diary'
      if (category !== 'all' && itemCategory !== category) return false
      if (!q) return true
      return `${item.title} ${itemCategory}`.toLowerCase().includes(q)
    })
  }, [category, query, visibleItems])

  const weeklyUpdates = filteredItems.slice(0, 3)
  const recentViewed = filteredItems.filter((item) => recentSlugs.has(item.slug)).slice(0, 3)

  if (loading) {
    return (
      <ul className="divide-y divide-[var(--ds-color-border-subtle)]">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonListItem key={i} />)}
      </ul>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/30">
        <p className="text-sm font-medium text-red-600 dark:text-red-300">{t('common.error')}</p>
        <p className="mt-1 font-mono text-xs text-red-400 dark:text-red-200">{error}</p>
      </div>
    )
  }

  if (visibleItems !== null && visibleItems.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--ds-color-border-default)] px-5 py-8 text-center text-sm text-[var(--ds-color-fg-subtle)]">
        {t('access.noContent')}
      </p>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── 検索・フィルター ──────────────────────────── */}
      <SectionReveal>
        <div className="rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* 検索 */}
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ds-color-fg-subtle)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('fanclub.searchPlaceholder', { defaultValue: 'タイトルで検索' })}
                className="input-surface w-full py-2 pl-9 pr-3 text-sm"
              />
            </div>
            {/* カテゴリ */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FanclubCategory)}
              className="input-surface w-full px-3 py-2 text-sm"
            >
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`fanclub.category.${key}`, { defaultValue: key === 'all' ? 'すべて' : key })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionReveal>

      {/* ── 今週の更新 ──────────────────────────────── */}
      {weeklyUpdates.length > 0 && (
        <SectionReveal delay={0.05}>
          <div className="overflow-hidden rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)]">
            <div className="flex items-center gap-2.5 border-b border-[var(--ds-color-border-subtle)] px-5 py-3.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-500 dark:text-violet-400">
                {t('fanclub.weeklyUpdates', { defaultValue: '今週の更新' })}
              </span>
            </div>
            <ul className="divide-y divide-[var(--ds-color-border-subtle)]">
              {weeklyUpdates.map((item, i) => (
                <motion.li
                  key={`weekly-${item.id}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={detailPath.fanclub(item.slug)}
                    className="group flex items-center justify-between px-5 py-4 hover:bg-[var(--ds-color-bg-muted)] transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--ds-color-fg-default)] group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-[var(--ds-color-fg-subtle)] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </SectionReveal>
      )}

      {/* ── 最近見たコンテンツ ──────────────────────── */}
      {recentViewed.length > 0 && (
        <SectionReveal delay={0.08}>
          <div className="overflow-hidden rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)]">
            <div className="border-b border-[var(--ds-color-border-subtle)] px-5 py-3.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ds-color-fg-subtle)]">
                {t('fanclub.recentlyViewed', { defaultValue: '最近見たコンテンツ' })}
              </span>
            </div>
            <ul className="divide-y divide-[var(--ds-color-border-subtle)]">
              {recentViewed.map((item) => (
                <li key={`recent-${item.id}`}>
                  <Link
                    to={detailPath.fanclub(item.slug)}
                    className="group flex items-center justify-between px-5 py-3.5 hover:bg-[var(--ds-color-bg-muted)] transition-colors"
                  >
                    <span className="text-sm text-[var(--ds-color-fg-default)] group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-[var(--ds-color-fg-subtle)] transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </SectionReveal>
      )}

      {/* ── コンテンツ一覧 ──────────────────────────── */}
      {filteredItems.length === 0 ? (
        <SectionReveal>
          <div className="rounded-2xl border border-dashed border-[var(--ds-color-border-default)] px-6 py-12 text-center">
            <p className="text-sm text-[var(--ds-color-fg-subtle)]">
              {t('fanclub.emptyFiltered', { defaultValue: '条件に合うコンテンツがありません。' })}
            </p>
          </div>
        </SectionReveal>
      ) : (
        <SectionReveal delay={0.05}>
          <div className="overflow-hidden rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)]">
            <div className="border-b border-[var(--ds-color-border-subtle)] px-5 py-3.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ds-color-fg-subtle)]">
                {t('fanclub.allContents', { defaultValue: 'すべてのコンテンツ' })}
                <span className="ml-2 text-[var(--ds-color-fg-subtle)]">
                  {filteredItems.length}
                </span>
              </span>
            </div>
            <ul className="divide-y divide-[var(--ds-color-border-subtle)]">
              {filteredItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={detailPath.fanclub(item.slug)}
                    className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-[var(--ds-color-bg-muted)] transition-colors"
                    onClick={() => {
                      trackViewHistory('blog', item.slug)
                      trackEvent('fanclub_content_click', { slug: item.slug })
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--ds-color-fg-default)] group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors truncate">
                        {item.title}
                      </p>
                      {item.publishAt && (
                        <p className="mt-0.5 text-xs text-[var(--ds-color-fg-subtle)]">
                          {formatDate(item.publishAt)}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 mt-0.5 font-mono text-xs text-[var(--ds-color-fg-subtle)] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </SectionReveal>
      )}

      {/* ── 会員向け導線ショートカット ──────────────── */}
      <SectionReveal delay={0.05}>
        <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-indigo-50/50 p-5 dark:border-violet-900/30 dark:from-violet-950/30 dark:to-indigo-950/20">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
            {t('fanclub.ctaLead', { defaultValue: '会員向けショートカット' })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={ROUTES.MEMBER}
              className="rounded-full border border-violet-300 bg-white px-4 py-1.5 text-xs font-medium text-violet-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
            >
              {t('nav.member')} →
            </Link>
            <Link
              to={storeLink(ROUTES.STORE)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {t('nav.store')} →
            </Link>
            <Link
              to={ROUTES.NEWS}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {t('nav.news')} →
            </Link>
          </div>
        </div>
      </SectionReveal>
    </div>
  )
}
