import type { StrapiListResponse, StrapiSingleResponse } from '@/types'
import type { StrapiQueryParams } from '@/lib/api/query'

export type CmsProvider = 'strapi' | 'wordpress'
export type CmsQueryParams = StrapiQueryParams

export interface CmsRequestOptions {
  signal?: AbortSignal
}

export interface CmsMedia {
  id?: string | number
  url: string
  alternativeText?: string | null
  width?: number | null
  height?: number | null
}

export interface CmsSeo {
  title?: string | null
  description?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  canonicalUrl?: string | null
  noindex?: boolean
  nofollow?: boolean
}

export type CmsListResponse<T> = StrapiListResponse<T>
export type CmsSingleResponse<T> = StrapiSingleResponse<T>
