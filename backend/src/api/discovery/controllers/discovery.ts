import { factories } from '@strapi/strapi'

type SourceSite = 'main' | 'store' | 'fc' | 'all'
type DiscoveryType = 'product' | 'news' | 'event' | 'fanclub' | 'faq' | 'guide' | 'blog' | 'page'

interface DiscoveryRecord {
  id: string
  sourceSite: SourceSite
  contentType: DiscoveryType
  title: string
  summary: string
  bodyExtract: string
  locale: string
  category: string | null
  tags: string[]
  slug: string
  path: string
  visibility: 'public' | 'fc_only' | 'limited'
  requiresAuth: boolean
  publishStatus: 'published'
  displayPriority: number
  updatedAt: string | null
  popularityScore: number
  related: Array<{ label: string; href: string; contentType: string }>
}

const MAX_LIMIT = 60

function normalizeText(value: unknown, max = 200): string {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.slice(0, max)
}

function normalizeSite(value: unknown): SourceSite {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'main' || v === 'store' || v === 'fc' || v === 'all') return v
  return 'all'
}

function normalizeType(value: unknown): DiscoveryType | 'all' {
  const v = String(value ?? '').trim().toLowerCase()
  if (['product', 'news', 'event', 'fanclub', 'faq', 'guide', 'blog', 'page'].includes(v)) return v as DiscoveryType
  return 'all'
}

function normalizeSort(value: unknown): 'relevance' | 'updated' {
  return String(value ?? '').trim().toLowerCase() === 'updated' ? 'updated' : 'relevance'
}

function toScore(item: DiscoveryRecord, keyword: string): number {
  if (!keyword) return (item.displayPriority ?? 0) + item.popularityScore
  const keywordLower = keyword.toLowerCase()
  let score = item.displayPriority * 5 + item.popularityScore
  if (item.title.toLowerCase().includes(keywordLower)) score += 90
  if (item.summary.toLowerCase().includes(keywordLower)) score += 40
  if (item.bodyExtract.toLowerCase().includes(keywordLower)) score += 25
  if (item.tags.join(' ').toLowerCase().includes(keywordLower)) score += 30
  return score
}

function withinVisibility(item: any, allowRestricted: boolean): boolean {
  const status = String(item.accessStatus ?? 'public')
  if (status === 'public') return true
  if (!allowRestricted) return false
  if (status === 'fc_only') return true
  if (status === 'limited') {
    const limitedEndAt = item.limitedEndAt ? new Date(String(item.limitedEndAt)) : null
    if (!limitedEndAt) return true
    if (limitedEndAt.getTime() >= Date.now()) return true
    return Boolean(item.archiveVisibleForFC)
  }
  return false
}

function matchesLocale(itemLocale: unknown, locale: string): boolean {
  if (!locale) return true
  const normalized = String(itemLocale ?? '').toLowerCase()
  if (!normalized) return true
  return normalized === locale
}

export default factories.createCoreController('api::site-setting.site-setting', ({ strapi }) => ({
  async search(ctx) {
    const q = normalizeText(ctx.query.q, 80)
    const sourceSite = normalizeSite(ctx.query.sourceSite)
    const contentType = normalizeType(ctx.query.contentType)
    const category = normalizeText(ctx.query.category, 80).toLowerCase()
    const locale = normalizeText(ctx.query.locale, 12).toLowerCase()
    const sort = normalizeSort(ctx.query.sort)
    const limit = Math.min(Math.max(Number(ctx.query.limit ?? 24), 1), MAX_LIMIT)
    const allowRestricted = String(ctx.query.memberState ?? '').toLowerCase() === 'member'

    const [products, news, events, fanclubContents, faqs, guides, blogs] = await Promise.all([
      strapi.documents('api::store-product.store-product').findMany({ fields: ['title', 'slug', 'description', 'category', 'tags', 'accessStatus', 'limitedEndAt', 'archiveVisibleForFC', 'displayPriority', 'updatedAt', 'shortHighlight', 'sourceSite'], status: 'published', limit: 120 }).catch(() => []),
      strapi.documents('api::news-item.news-item').findMany({ fields: ['title', 'slug', 'body', 'accessStatus', 'limitedEndAt', 'archiveVisibleForFC', 'updatedAt', 'sourceSite'], status: 'published', limit: 120 }).catch(() => []),
      strapi.documents('api::event.event').findMany({ fields: ['title', 'slug', 'description', 'accessStatus', 'limitedEndAt', 'archiveVisibleForFC', 'updatedAt', 'sourceSite'], status: 'published', limit: 120 }).catch(() => []),
      strapi.documents('api::fanclub-content.fanclub-content').findMany({ fields: ['title', 'slug', 'body', 'category', 'accessStatus', 'limitedEndAt', 'archiveVisibleForFC', 'displayPriority', 'updatedAt', 'shortHighlight'], status: 'published', limit: 120 }).catch(() => []),
      strapi.documents('api::faq.faq').findMany({ fields: ['question', 'answer', 'slug', 'category', 'tags', 'sourceSite', 'isPublic', 'displayPriority', 'updatedAt', 'keywords', 'locale'], status: 'published', limit: 200 }).catch(() => []),
      strapi.documents('api::guide.guide').findMany({ fields: ['title', 'summary', 'body', 'slug', 'category', 'tags', 'sourceSite', 'displayPriority', 'updatedAt', 'locale'], status: 'published', limit: 200 }).catch(() => []),
      strapi.documents('api::blog-post.blog-post').findMany({ fields: ['title', 'slug', 'body', 'tags', 'accessStatus', 'limitedEndAt', 'archiveVisibleForFC', 'updatedAt'], status: 'published', limit: 120 }).catch(() => []),
    ])

    const records: DiscoveryRecord[] = []

    for (const item of products as any[]) {
      if (!withinVisibility(item, allowRestricted)) continue
      records.push({ id: `product:${item.slug}`, sourceSite: 'store', contentType: 'product', title: normalizeText(item.title, 120), summary: normalizeText(item.shortHighlight || item.description, 180), bodyExtract: normalizeText(item.description, 240), locale: 'ja', category: normalizeText(item.category, 80) || null, tags: Array.isArray(item.tags) ? item.tags.map((v: unknown) => normalizeText(v, 40)).filter(Boolean) : [], slug: normalizeText(item.slug, 120), path: `/products/${item.slug}`, visibility: item.accessStatus ?? 'public', requiresAuth: item.accessStatus === 'fc_only', publishStatus: 'published', displayPriority: Number(item.displayPriority ?? 0), updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 30, related: [{ label: 'ガイドを見る', href: '/guide', contentType: 'guide' }, { label: 'サポートを見る', href: '/support', contentType: 'guide' }] })
    }
    for (const item of news as any[]) {
      if (!withinVisibility(item, allowRestricted)) continue
      records.push({ id: `news:${item.slug}`, sourceSite: normalizeSite(item.sourceSite || 'main') === 'all' ? 'main' : normalizeSite(item.sourceSite || 'main'), contentType: 'news', title: normalizeText(item.title, 120), summary: normalizeText(item.body, 180), bodyExtract: normalizeText(item.body, 260), locale: 'ja', category: 'news', tags: [], slug: normalizeText(item.slug, 120), path: `/news/${item.slug}`, visibility: item.accessStatus ?? 'public', requiresAuth: item.accessStatus === 'fc_only', publishStatus: 'published', displayPriority: 0, updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 20, related: [{ label: '関連イベントへ', href: '/events', contentType: 'event' }] })
    }
    for (const item of events as any[]) {
      if (!withinVisibility(item, allowRestricted)) continue
      records.push({ id: `event:${item.slug}`, sourceSite: normalizeSite(item.sourceSite || 'main') === 'all' ? 'main' : normalizeSite(item.sourceSite || 'main'), contentType: 'event', title: normalizeText(item.title, 120), summary: normalizeText(item.description, 180), bodyExtract: normalizeText(item.description, 260), locale: 'ja', category: 'event', tags: [], slug: normalizeText(item.slug, 120), path: `/events/${item.slug}`, visibility: item.accessStatus ?? 'public', requiresAuth: item.accessStatus === 'fc_only', publishStatus: 'published', displayPriority: 0, updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 18, related: [{ label: '関連商品へ', href: '/products', contentType: 'product' }] })
    }
    for (const item of fanclubContents as any[]) {
      if (!withinVisibility(item, allowRestricted)) continue
      records.push({ id: `fanclub:${item.slug}`, sourceSite: 'fc', contentType: 'fanclub', title: normalizeText(item.title, 120), summary: normalizeText(item.shortHighlight || item.body, 180), bodyExtract: normalizeText(item.body, 240), locale: 'ja', category: normalizeText(item.category, 80) || 'fanclub', tags: [], slug: normalizeText(item.slug, 120), path: `/movies/${item.slug}`, visibility: item.accessStatus ?? 'fc_only', requiresAuth: true, publishStatus: 'published', displayPriority: Number(item.displayPriority ?? 0), updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 34, related: [{ label: '会員ガイドへ', href: '/guide', contentType: 'guide' }, { label: 'メンバーストアへ', href: '/member-store', contentType: 'product' }] })
    }
    for (const item of faqs as any[]) {
      if (item.isPublic === false && !allowRestricted) continue
      if (!matchesLocale(item.locale, locale)) continue
      records.push({ id: `faq:${item.slug}`, sourceSite: normalizeSite(item.sourceSite), contentType: 'faq', title: normalizeText(item.question, 120), summary: normalizeText(item.answer, 180), bodyExtract: normalizeText(item.answer, 260), locale: normalizeText(item.locale, 12) || 'ja', category: normalizeText(item.category, 80) || null, tags: [...(Array.isArray(item.tags) ? item.tags : []), ...(Array.isArray(item.keywords) ? item.keywords : [])].map((v: unknown) => normalizeText(v, 40)).filter(Boolean), slug: normalizeText(item.slug, 120), path: '/faq', visibility: item.isPublic === false ? 'fc_only' : 'public', requiresAuth: item.isPublic === false, publishStatus: 'published', displayPriority: Number(item.displayPriority ?? 0), updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 15, related: [{ label: 'サポートセンターへ', href: '/support', contentType: 'guide' }] })
    }
    for (const item of guides as any[]) {
      if (!matchesLocale(item.locale, locale)) continue
      records.push({ id: `guide:${item.slug}`, sourceSite: normalizeSite(item.sourceSite), contentType: 'guide', title: normalizeText(item.title, 120), summary: normalizeText(item.summary, 180), bodyExtract: normalizeText(item.body, 260), locale: normalizeText(item.locale, 12) || 'ja', category: normalizeText(item.category, 80) || null, tags: Array.isArray(item.tags) ? item.tags.map((v: unknown) => normalizeText(v, 40)).filter(Boolean) : [], slug: normalizeText(item.slug, 120), path: `/support/guides/${item.slug}`, visibility: 'public', requiresAuth: false, publishStatus: 'published', displayPriority: Number(item.displayPriority ?? 0), updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 14, related: [{ label: 'お問い合わせへ', href: '/contact', contentType: 'page' }] })
    }
    for (const item of blogs as any[]) {
      if (!withinVisibility(item, allowRestricted)) continue
      records.push({ id: `blog:${item.slug}`, sourceSite: 'main', contentType: 'blog', title: normalizeText(item.title, 120), summary: normalizeText(item.body, 180), bodyExtract: normalizeText(item.body, 240), locale: 'ja', category: 'blog', tags: Array.isArray(item.tags) ? item.tags.map((v: unknown) => normalizeText(v, 40)).filter(Boolean) : [], slug: normalizeText(item.slug, 120), path: `/blog/${item.slug}`, visibility: item.accessStatus ?? 'public', requiresAuth: item.accessStatus === 'fc_only', publishStatus: 'published', displayPriority: 0, updatedAt: item.updatedAt ? String(item.updatedAt) : null, popularityScore: 12, related: [{ label: '最新ニュースへ', href: '/news', contentType: 'news' }] })
    }

    records.push(
      { id: 'page:about', sourceSite: 'main', contentType: 'page', title: 'About mizzz', summary: 'ブランド全体の背景・活動を確認', bodyExtract: 'プロフィール、活動実績、制作姿勢を確認できます。', locale: 'ja', category: 'about', tags: ['about'], slug: 'about', path: '/about', visibility: 'public', requiresAuth: false, publishStatus: 'published', displayPriority: 2, updatedAt: null, popularityScore: 8, related: [{ label: 'Contactへ', href: '/contact', contentType: 'page' }] },
      { id: 'page:support', sourceSite: sourceSite === 'all' ? 'main' : sourceSite, contentType: 'page', title: 'Support Center', summary: 'FAQ / Guide / Contact導線をまとめたサポート入口', bodyExtract: 'トラブル解消・ガイド・問い合わせにアクセスできます。', locale: 'ja', category: 'support', tags: ['support', 'faq', 'guide'], slug: 'support', path: '/support', visibility: 'public', requiresAuth: false, publishStatus: 'published', displayPriority: 5, updatedAt: null, popularityScore: 10, related: [{ label: 'FAQへ', href: '/faq', contentType: 'faq' }] },
    )

    let filtered = records.filter((item) => {
      if (sourceSite !== 'all' && item.sourceSite !== sourceSite && item.sourceSite !== 'all') return false
      if (contentType !== 'all' && item.contentType !== contentType) return false
      if (locale && item.locale && item.locale !== locale) return false
      if (category && item.category && !String(item.category).toLowerCase().includes(category)) return false
      if (!q) return true
      const haystack = [item.title, item.summary, item.bodyExtract, item.category ?? '', item.tags.join(' ')].join(' ').toLowerCase()
      return haystack.includes(q.toLowerCase())
    })

    filtered = filtered
      .map((item) => ({ ...item, _score: toScore(item, q) }))
      .sort((a: DiscoveryRecord & { _score: number }, b: DiscoveryRecord & { _score: number }) => (sort === 'updated' ? String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')) : b._score - a._score))
      .slice(0, limit)
      .map(({ _score, ...rest }) => rest)

    const facets = {
      contentType: Object.entries(filtered.reduce((acc: Record<string, number>, item) => { acc[item.contentType] = (acc[item.contentType] ?? 0) + 1; return acc }, {})),
      sourceSite: Object.entries(filtered.reduce((acc: Record<string, number>, item) => { acc[item.sourceSite] = (acc[item.sourceSite] ?? 0) + 1; return acc }, {})),
    }

    ctx.body = {
      query: { q, sourceSite, contentType, category, locale, sort, limit, memberState: allowRestricted ? 'member' : 'guest' },
      total: filtered.length,
      facets,
      items: filtered,
      recommendations: {
        noResultFallback: [
          { title: 'Support Center', path: '/support', contentType: 'guide' },
          { title: 'Store Products', path: '/products', contentType: 'product' },
          { title: 'Fanclub Join', path: '/join', contentType: 'fanclub' },
        ],
      },
    }
  },
}))
