import * as strapiProvider from './strapi'
import * as wordpressProvider from './wordpress'
import type {
  CmsListResponse,
  CmsProvider,
  CmsQueryParams,
  CmsRequestOptions,
  CmsSingleResponse,
} from './types'

function getCmsProvider(): CmsProvider {
  const provider = import.meta.env.VITE_CMS_PROVIDER
  if (provider === 'wordpress') return 'wordpress'
  return 'strapi'
}

const provider = getCmsProvider() === 'wordpress' ? wordpressProvider : strapiProvider

export function fetchCollection<T>(
  endpoint: string,
  params?: CmsQueryParams,
  requestOptions?: CmsRequestOptions,
): Promise<CmsListResponse<T>> {
  return provider.fetchCollection<T>(endpoint, params, requestOptions)
}

export function fetchSingle<T>(
  endpoint: string,
  params?: CmsQueryParams,
  requestOptions?: CmsRequestOptions,
): Promise<CmsSingleResponse<T>> {
  return provider.fetchSingle<T>(endpoint, params, requestOptions)
}

export function fetchBySlug<T>(
  endpoint: string,
  slug: string,
  params?: Omit<CmsQueryParams, 'filters' | 'pagination'>,
  requestOptions?: CmsRequestOptions,
): Promise<T | null> {
  return provider.fetchBySlug<T>(endpoint, slug, params, requestOptions)
}

export type { CmsListResponse, CmsSingleResponse, CmsQueryParams, CmsProvider } from './types'
