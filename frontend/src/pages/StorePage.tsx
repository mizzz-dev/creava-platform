import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useProductList } from '@/modules/store/hooks/useProductList'
import { useContentAccess } from '@/hooks'
import ProductCard from '@/modules/store/components/ProductCard'
import PageHead from '@/components/seo/PageHead'
import StructuredData from '@/components/seo/StructuredData'
import SkeletonProductCard from '@/components/common/SkeletonProductCard'
import { ROUTES } from '@/lib/routeConstants'
import Badge from '@/components/common/Badge'
import { SITE_URL } from '@/lib/seo'
import { useListPageWebVitals } from '@/modules/analytics/webVitals'
import { DISPLAY_CURRENCIES } from '@/modules/store/lib/currency'
import { useDisplayCurrency } from '@/modules/store/hooks/useDisplayCurrency'
import { getRankedProducts, type RankingRange } from '@/modules/store/lib/ranking'
import { forecastStockout, getAbVariant, getHistoryByKind, getRegionCommercePolicy } from '@/modules/store/lib/commerceOptimization'
import { trackEvent } from '@/modules/analytics'
import SectionReveal from '@/components/common/SectionReveal'

const STATUS_FILTERS = ['all', 'available', 'coming_soon', 'soldout'] as const
const SORT_OPTIONS = ['recommended', 'newest', 'priceAsc', 'priceDesc'] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]
type SortOption = (typeof SORT_OPTIONS)[number]

/* ── フィルターバー ──────────────────────────────── */
function StatusChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`interactive-chip ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  )
}

export default function StorePage() {
  const { t } = useTranslation()
  useListPageWebVitals('store-list')
  const { products, loading, error } = useProductList(24)
  const { filterVisible } = useContentAccess()
  const { currency, updateCurrency } = useDisplayCurrency('JPY')
  const [rankingRange, setRankingRange] = useState<RankingRange>('7d')
  const [region, setRegion] = useState<'JP' | 'US' | 'EU' | 'ROW'>('JP')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [hideSoldOut, setHideSoldOut] = useState(false)

  const visibleProducts = filterVisible(products)
  const heroVariant = useMemo(() => getAbVariant('storeHero'), [])
  const rankingVariant = useMemo(() => getAbVariant('storeRanking'), [])
  const ctaVariant = useMemo(() => getAbVariant('storeCta'), [])
  const regionPolicy = getRegionCommercePolicy(region)
  const rankingProducts = getRankedProducts(visibleProducts, rankingRange, 3)
  const categories = useMemo(() => ['all', ...new Set(visibleProducts.map((p) => p.category).filter(Boolean))], [visibleProducts])
  const recentSlugs = useMemo(() => new Set(getHistoryByKind('product').slice(0, 10)), [])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const base = visibleProducts.filter((p) => {
      if (statusFilter !== 'all' && p.purchaseStatus !== statusFilter) return false
      if (hideSoldOut && p.purchaseStatus === 'soldout') return false
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
      if (selectedTag !== 'all' && !p.tags.includes(selectedTag)) return false
      if (!normalizedQuery) return true
      return `${p.title} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(normalizedQuery)
    })

    if (sortBy === 'newest') return [...base].sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival) || a.sortOrder - b.sortOrder)
    if (sortBy === 'priceAsc') return [...base].sort((a, b) => a.price - b.price)
    if (sortBy === 'priceDesc') return [...base].sort((a, b) => b.price - a.price)
    return [...base].sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.isNewArrival) - Number(a.isNewArrival) || a.sortOrder - b.sortOrder)
  }, [hideSoldOut, query, selectedCategory, selectedTag, sortBy, statusFilter, visibleProducts])

  const featuredProducts = filteredProducts.filter((p) => p.featured).slice(0, 4)
  const viewedProducts = filteredProducts.filter((p) => recentSlugs.has(p.slug)).slice(0, 4)

  const stockoutForecast = forecastStockout(visibleProducts.slice(0, 3).map((p, i) => ({
    productId: p.id,
    productTitle: p.title,
    stockUnits: 30 - i * 8,
    soldUnitsLast7d: 10 + i * 4,
    restockLeadDays: 14,
    notifyWaitlist: 12 + i * 3,
  })))

  return (
    <div className="min-h-screen">
      <PageHead
        title={t('store.title')}
        description={t('seo.store', {
          defaultValue: '作品販売と制作依頼の両方にアクセスできるストアページ。限定商品と依頼導線をまとめて案内します。',
        })}
      />
      <StructuredData
        schema={{
          type: 'BreadcrumbList',
          items: [
            { name: 'Home', url: SITE_URL },
            { name: t('store.title'), url: `${SITE_URL}${ROUTES.STORE}` },
          ],
        }}
      />

      {/* ── ヒーローセクション ─────────────────────────── */}
      <section className="relative overflow-hidden store-hero-surface">
        {/* オーバーレイ */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.15),transparent_55%)]" />
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-10" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:gap-16 lg:items-center">
            {/* 左: コピー */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300/80">
                mizzz official store
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[56px]">
                {t('store.title')}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-indigo-100/80">
                {heroVariant === 'A'
                  ? t('store.ecHeroCopyA', { defaultValue: '新作ドロップ・限定販売・先行案内を1ページで完結。お気に入りから最短導線で購入できます。' })
                  : t('store.ecHeroCopyB', { defaultValue: 'キャンペーン、ランキング、再販通知を統合したEC体験で、欲しいアイテムに最短でアクセスできます。' })}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#store-products"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-xl"
                >
                  {ctaVariant === 'A'
                    ? t('store.heroCtaPrimary', { defaultValue: '今すぐ購入する' })
                    : t('store.heroCtaPrimaryAlt', { defaultValue: '人気商品を見る' })}
                  <span>→</span>
                </a>
                <Link
                  to={ROUTES.CART}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/30"
                >
                  {t('cart.goToCart', { defaultValue: 'カートを見る' })}
                </Link>
              </div>

              {/* キャンペーン補足 */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                </span>
                <span className="text-xs text-white/80">
                  {t('store.campaignTitle', { defaultValue: '春の限定ドロップ' })}
                  <span className="ml-2 font-mono text-[10px] text-indigo-200/60">
                    — {t('store.campaignBody', { defaultValue: '会員先行販売・限定バンドルあり' })}
                  </span>
                </span>
                <Link
                  to={ROUTES.FANCLUB}
                  className="ml-2 shrink-0 font-mono text-[10px] text-violet-300 underline underline-offset-2 transition-colors hover:text-violet-200"
                >
                  {t('store.campaignCta', { defaultValue: '詳細を見る' })}
                </Link>
              </div>
            </motion.div>

            {/* 右: 統計カード */}
            <motion.div
              initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <div className="w-[200px] space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-indigo-300/50">
                  // store.status
                </p>
                {[
                  { label: 'PRODUCTS', value: `${visibleProducts.length}+`, color: 'text-cyan-300' },
                  { label: 'AVAILABLE', value: `${visibleProducts.filter(p => p.purchaseStatus === 'available').length}`, color: 'text-emerald-300' },
                  { label: 'REGION', value: region, color: 'text-amber-300' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="font-mono text-[9px] text-indigo-300/40 tracking-widest">{label}</span>
                    <span className={`font-mono text-[10px] font-medium ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14 space-y-8">

        {/* ── フィルター + 検索エリア ────────────────────── */}
        <SectionReveal>
          <div className="rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] p-5 shadow-sm">
            {/* ステータスフィルター */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-[var(--ds-color-border-subtle)]">
              {STATUS_FILTERS.map((status) => (
                <StatusChip
                  key={status}
                  active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  label={
                    status === 'all' ? t('store.filterAll', { defaultValue: 'すべて' })
                    : status === 'available' ? t('store.filterAvailable', { defaultValue: '販売中' })
                    : status === 'coming_soon' ? t('store.filterComingSoon', { defaultValue: '販売準備中' })
                    : t('store.filterSoldOut', { defaultValue: '完売' })
                  }
                />
              ))}
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs text-[var(--ds-color-fg-muted)]">
                <input
                  type="checkbox"
                  checked={hideSoldOut}
                  onChange={(e) => setHideSoldOut(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-violet-600"
                />
                {t('store.hideSoldOut', { defaultValue: '完売を非表示' })}
              </label>
            </div>

            {/* 検索・ソート・カテゴリ */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* 検索 */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ds-color-fg-subtle)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('store.searchPlaceholder', { defaultValue: '商品名・カテゴリ・タグで検索' })}
                  className="input-surface w-full py-2 pl-9 pr-3 text-sm"
                />
              </div>

              {/* ソート */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-surface w-full px-3 py-2 text-sm"
              >
                <option value="recommended">{t('store.sortRecommended', { defaultValue: 'おすすめ順' })}</option>
                <option value="newest">{t('store.sortNewest', { defaultValue: '新着順' })}</option>
                <option value="priceAsc">{t('store.sortPriceAsc', { defaultValue: '価格が安い順' })}</option>
                <option value="priceDesc">{t('store.sortPriceDesc', { defaultValue: '価格が高い順' })}</option>
              </select>

              {/* カテゴリ */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-surface w-full px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? t('store.filterAll', { defaultValue: 'すべて' }) : c}</option>
                ))}
              </select>

              {/* 通貨 / 地域 */}
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => updateCurrency(e.target.value as typeof currency)}
                  className="input-surface flex-1 px-3 py-2 text-sm"
                >
                  {DISPLAY_CURRENCIES.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as typeof region)}
                  className="input-surface w-20 px-2 py-2 text-sm"
                >
                  <option value="JP">JP</option>
                  <option value="US">US</option>
                  <option value="EU">EU</option>
                  <option value="ROW">ROW</option>
                </select>
              </div>
            </div>

            {/* 地域ポリシー表示 */}
            <p className="mt-3 font-mono text-[10px] text-[var(--ds-color-fg-subtle)]">
              {t('store.regionNotice', {
                defaultValue: `通貨:${regionPolicy.currency} / 送料:${regionPolicy.shippingFee} / 税率:${Math.round(regionPolicy.taxRate * 100)}% / 配送:${regionPolicy.canShip ? '可' : '不可'}`,
              })}
            </p>
          </div>
        </SectionReveal>

        {/* ── 特集ピックアップ ──────────────────────────── */}
        {featuredProducts.length > 0 && (
          <SectionReveal>
            <div className="rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--ds-color-border-subtle)] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span className="store-featured-badge">
                    {t('store.featuredTitle', { defaultValue: '特集ピックアップ' })}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[var(--ds-color-fg-subtle)] uppercase tracking-widest">
                  {featuredProducts.length} items
                </span>
              </div>
              <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((p, i) => (
                  <motion.div
                    key={`featured-${p.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={p} displayCurrency={currency} />
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>
        )}

        {/* ── 最近見た商品 ──────────────────────────────── */}
        {viewedProducts.length > 0 && (
          <SectionReveal delay={0.05}>
            <div className="rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] overflow-hidden">
              <div className="flex items-center border-b border-[var(--ds-color-border-subtle)] px-5 py-3.5">
                <span className="store-featured-badge text-[var(--ds-color-fg-subtle)]">
                  {t('store.recentlyViewed', { defaultValue: '最近見た商品' })}
                </span>
              </div>
              <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {viewedProducts.map((p) => (
                  <ProductCard key={`viewed-${p.id}`} product={p} displayCurrency={currency} />
                ))}
              </div>
            </div>
          </SectionReveal>
        )}

        {/* ── ランキング ──────────────────────────────────── */}
        {rankingProducts.length > 0 && (
          <SectionReveal delay={0.05}>
            <div className="rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ds-color-border-subtle)] px-5 py-3.5">
                <span className="store-featured-badge">
                  {rankingVariant === 'A'
                    ? t('store.rankingTitle', { defaultValue: '売上ランキング' })
                    : t('store.rankingTitleB', { defaultValue: '人気トレンド' })}
                </span>
                <div className="inline-flex items-center rounded-full border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-muted)] p-0.5">
                  {(['7d', '30d'] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setRankingRange(range)}
                      className={`rounded-full px-3 py-1 text-[11px] font-mono transition-all ${
                        rankingRange === range
                          ? 'bg-[var(--ds-color-fg-default)] text-[var(--ds-color-bg-surface)]'
                          : 'text-[var(--ds-color-fg-muted)] hover:text-[var(--ds-color-fg-default)]'
                      }`}
                    >
                      {range === '7d' ? t('store.ranking7d', { defaultValue: '7日' }) : t('store.ranking30d', { defaultValue: '30日' })}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[var(--ds-color-border-subtle)]">
                {rankingProducts.map((p, i) => (
                  <div key={`rank-${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--ds-color-bg-muted)] transition-colors">
                    <span className="font-display text-2xl font-bold text-[var(--ds-color-fg-subtle)] w-7 shrink-0">
                      {i + 1}
                    </span>
                    <Link
                      to={`/store/${p.slug}`}
                      className="flex-1 text-sm font-medium text-[var(--ds-color-fg-default)] hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                    >
                      {p.title}
                    </Link>
                    <Badge
                      variant={p.purchaseStatus === 'soldout' ? 'soldout' : p.purchaseStatus === 'coming_soon' ? 'coming_soon' : 'new'}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        )}

        {/* ── 在庫予測 ──────────────────────────────────── */}
        {stockoutForecast.length > 0 && (
          <SectionReveal delay={0.05}>
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                <p className="font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {t('store.stockoutTitle', { defaultValue: '在庫予測 / 欠品予防' })}
                </p>
              </div>
              <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                {stockoutForecast.map((row) => (
                  <li key={row.productId}>
                    {row.productTitle}: {t('store.stockoutSummary', { defaultValue: `${row.daysUntilStockout}日で欠品予測 (${row.estimatedStockoutDate})` })}
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        )}

        {/* ── ステータスガイド ───────────────────────────── */}
        <SectionReveal delay={0.05}>
          <div className="rounded-2xl border border-[var(--ds-color-border-subtle)] bg-[var(--ds-color-bg-muted)] px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ds-color-fg-subtle)] mb-3">
              status guide
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">AVAILABLE</span>
                <span className="text-[var(--ds-color-fg-muted)]">購入可能</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="coming_soon" size="sm" />
                <span className="text-[var(--ds-color-fg-muted)]">{t('store.statusComingSoon', { defaultValue: '販売準備中' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="soldout" size="sm" />
                <span className="text-[var(--ds-color-fg-muted)]">{t('store.statusSoldout', { defaultValue: '完売。再販情報はNews/FCで案内' })}</span>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* ── 商品グリッド ──────────────────────────────── */}
        {loading && (
          <div id="store-products" className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
          </div>
        )}

        {error && (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-mono text-sm text-red-500 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            ! {t('common.error')}
          </p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <SectionReveal>
            <div className="rounded-2xl border border-dashed border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-muted)] px-8 py-16 text-center">
              <p className="font-mono text-sm text-[var(--ds-color-fg-subtle)]">
                {t('home.store.comingSoon')}
              </p>
              <p className="mt-2 text-xs text-[var(--ds-color-fg-subtle)]">
                {t('store.empty')}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to={ROUTES.CONTACT}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ds-color-fg-default)] transition-all hover:border-[var(--ds-color-border-strong)] hover:shadow-sm"
                >
                  {t('store.requestCta')} →
                </Link>
                <Link
                  to={ROUTES.FANCLUB}
                  className="inline-flex items-center gap-1 font-mono text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  {t('store.emptySubCta')} →
                </Link>
              </div>
            </div>
          </SectionReveal>
        )}

        {filteredProducts.length > 0 && (
          <div id="store-products" className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => trackEvent('store_product_card_click', { slug: p.slug })}>
                <ProductCard product={p} displayCurrency={currency} />
              </div>
            ))}
          </div>
        )}

        {/* ── フッター導線 ──────────────────────────────── */}
        {!loading && (
          <SectionReveal delay={0.05}>
            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--ds-color-border-default)] bg-[var(--ds-color-bg-surface)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--ds-color-fg-default)]">{t('store.fcNote')}</p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--ds-color-fg-subtle)]">{t('store.stripeNote')}</p>
              </div>
              <Link
                to={ROUTES.FANCLUB}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-md dark:bg-violet-700 dark:hover:bg-violet-600"
              >
                {t('home.fanclub.joinButton')} <span>→</span>
              </Link>
            </div>
          </SectionReveal>
        )}
      </div>
    </div>
  )
}
