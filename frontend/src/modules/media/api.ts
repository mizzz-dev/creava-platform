import { fetchCollection } from '@/lib/api/strapi'
import type { StrapiQueryParams } from '@/lib/api/strapi'
import type { MediaItem, Award, StrapiListResponse } from '@/types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export function getMediaList(
  params?: StrapiQueryParams,
): Promise<StrapiListResponse<MediaItem>> {
  return fetchCollection<MediaItem>(API_ENDPOINTS.mediaItems, {
    sort: ['publishedAt:desc'],
    ...params,
  })
}

export function getAwardsList(
  params?: StrapiQueryParams,
): Promise<StrapiListResponse<Award>> {
  return fetchCollection<Award>(API_ENDPOINTS.awards, {
    sort: ['year:desc'],
    ...params,
  })
}
