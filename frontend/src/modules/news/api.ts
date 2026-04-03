import { fetchCollection, fetchBySlug } from '@/lib/api/strapi'
import type { StrapiQueryParams } from '@/lib/api/strapi'
import type { NewsItem, StrapiListResponse } from '@/types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

/** Strapi のコレクションエンドポイント名 */
const ENDPOINT = API_ENDPOINTS.news

/**
 * ニュース一覧を取得する
 */
export function getNewsList(
  params?: StrapiQueryParams,
): Promise<StrapiListResponse<NewsItem>> {
  return fetchCollection<NewsItem>(ENDPOINT, {
    sort: ['publishAt:desc'],
    populate: ['thumbnail'],
    ...params,
  })
}

/**
 * スラッグでニュース詳細を取得する
 */
export function getNewsDetail(
  slug: string,
  params?: Omit<StrapiQueryParams, 'filters' | 'pagination'>,
): Promise<NewsItem | null> {
  return fetchBySlug<NewsItem>(ENDPOINT, slug, { populate: ['thumbnail'], ...params })
}
