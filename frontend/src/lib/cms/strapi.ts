import type { StrapiRequestOptions } from '@/lib/api/client'
import {
  fetchBySlug as fetchBySlugFromStrapi,
  fetchCollection as fetchCollectionFromStrapi,
  fetchSingle as fetchSingleFromStrapi,
} from '@/lib/api/strapi'
import type { CmsListResponse, CmsQueryParams, CmsRequestOptions, CmsSingleResponse } from './types'

export function fetchCollection<T>(
  endpoint: string,
  params?: CmsQueryParams,
  requestOptions?: CmsRequestOptions,
): Promise<CmsListResponse<T>> {
  return fetchCollectionFromStrapi<T>(endpoint, params, requestOptions as StrapiRequestOptions)
}

export function fetchSingle<T>(
  endpoint: string,
  params?: CmsQueryParams,
  requestOptions?: CmsRequestOptions,
): Promise<CmsSingleResponse<T>> {
  return fetchSingleFromStrapi<T>(endpoint, params, requestOptions as StrapiRequestOptions)
}

export function fetchBySlug<T>(
  endpoint: string,
  slug: string,
  params?: Omit<CmsQueryParams, 'filters' | 'pagination'>,
  requestOptions?: CmsRequestOptions,
): Promise<T | null> {
  return fetchBySlugFromStrapi<T>(endpoint, slug, params, requestOptions as StrapiRequestOptions)
}
