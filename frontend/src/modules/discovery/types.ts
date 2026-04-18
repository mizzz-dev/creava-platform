export type DiscoverySourceSite = 'main' | 'store' | 'fc' | 'all'
export type DiscoveryContentType = 'all' | 'product' | 'news' | 'event' | 'fanclub' | 'faq' | 'guide' | 'blog' | 'page'

export interface DiscoverySearchQuery {
  q: string
  sourceSite: DiscoverySourceSite
  contentType: DiscoveryContentType
  category: string
  locale: 'ja' | 'en' | 'ko'
  sort: 'relevance' | 'updated'
  memberState: 'guest' | 'member'
  limit?: number
}

export interface DiscoveryItem {
  id: string
  sourceSite: Exclude<DiscoverySourceSite, 'all'>
  contentType: Exclude<DiscoveryContentType, 'all'>
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

export interface DiscoverySearchResponse {
  query: DiscoverySearchQuery
  total: number
  facets: {
    contentType: Array<[string, number]>
    sourceSite: Array<[string, number]>
  }
  items: DiscoveryItem[]
  recommendations?: {
    noResultFallback?: Array<{ title: string; path: string; contentType: string }>
  }
}
