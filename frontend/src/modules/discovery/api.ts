import { strapiGet } from '@/lib/api/client'
import type { DiscoverySearchQuery, DiscoverySearchResponse } from './types'

export async function searchDiscovery(query: DiscoverySearchQuery): Promise<DiscoverySearchResponse> {
  const params = new URLSearchParams()
  params.set('q', query.q)
  params.set('sourceSite', query.sourceSite)
  params.set('contentType', query.contentType)
  params.set('category', query.category)
  params.set('locale', query.locale)
  params.set('sort', query.sort)
  params.set('memberState', query.memberState)
  params.set('limit', String(query.limit ?? 24))
  return strapiGet<DiscoverySearchResponse>(`/discovery/search?${params.toString()}`, '', { auth: 'none' })
}
