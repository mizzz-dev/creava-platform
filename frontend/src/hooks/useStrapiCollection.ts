import { useEffect } from 'react'
import { useAsyncState } from './useAsyncState'
import type { StrapiListResponse, StrapiSingleResponse } from '@/types'

type FetcherWithAbort<T> = (signal?: AbortSignal) => Promise<T>

/**
 * Strapi Collection Type の一覧を取得するフック
 *
 * @param fetcher - API 関数を呼び出すコールバック
 *
 * @example
 * const { items, loading, error } = useStrapiCollection(
 *   (signal) => getNewsList({ pagination: { pageSize: 10 } }, { signal })
 * )
 */
export function useStrapiCollection<T>(
  fetcher: FetcherWithAbort<StrapiListResponse<T>>,
) {
  const { data, loading, error, execute } = useAsyncState<StrapiListResponse<T>>()

  useEffect(() => {
    const controller = new AbortController()
    void execute(() => fetcher(controller.signal))

    // fetcher は呼び出し元で安定した参照を渡すことを前提とする
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => controller.abort()
  }, [])

  return {
    /** 取得したアイテム配列。未取得時は null */
    items: data?.data ?? null,
    /** ページネーション情報 */
    pagination: data?.meta.pagination ?? null,
    loading,
    error,
    /** 再取得 */
    refetch: () => {
      const controller = new AbortController()
      return execute(() => fetcher(controller.signal))
    },
  }
}

/**
 * Strapi Single Type を取得するフック
 *
 * @param fetcher - API 関数を呼び出すコールバック
 *
 * @example
 * const { item, loading, error } = useStrapiSingle((signal) => getSiteSettings(undefined, { signal }))
 */
export function useStrapiSingle<T>(
  fetcher: FetcherWithAbort<StrapiSingleResponse<T>>,
) {
  const { data, loading, error, execute } = useAsyncState<StrapiSingleResponse<T>>()

  useEffect(() => {
    const controller = new AbortController()
    void execute(() => fetcher(controller.signal))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => controller.abort()
  }, [])

  return {
    /** 取得したアイテム。未取得時は null */
    item: data?.data ?? null,
    loading,
    error,
    refetch: () => {
      const controller = new AbortController()
      return execute(() => fetcher(controller.signal))
    },
  }
}
