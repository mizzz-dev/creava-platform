export class CmsApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
    public readonly details?: {
      url: string
      contentType: string
      responseSnippet?: string
      retried: number
      requestId?: string | null
    },
  ) {
    super(message)
    this.name = 'CmsApiError'
  }
}

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_STRAPI_TIMEOUT_MS ?? 15000)
const MAX_RETRIES = Number(import.meta.env.VITE_STRAPI_RETRY_COUNT ?? 2)
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBackoffMs(attempt: number): number {
  return 400 * 2 ** (attempt - 1)
}

async function parseJsonOrThrow<T>(res: Response, url: string, retried: number): Promise<T> {
  const contentType = res.headers.get('content-type') ?? 'unknown'
  const requestId = res.headers.get('x-request-id')

  if (!contentType.includes('application/json')) {
    const body = await res.text().catch(() => '')
    const snippet = body.slice(0, 220).trim()
    const htmlLike = /<!doctype html>|<html/i.test(snippet)
    throw new CmsApiError(
      res.status,
      res.statusText,
      htmlLike
        ? '[CMS] JSON ではなく HTML を受信しました。API URL、認証、サーバー状態を確認してください。'
        : `[CMS] JSON 以外のレスポンスです (content-type: ${contentType})`,
      { url, contentType, responseSnippet: snippet || undefined, retried, requestId },
    )
  }

  try {
    return (await res.json()) as T
  } catch {
    throw new CmsApiError(
      res.status,
      res.statusText,
      '[CMS] JSON パースに失敗しました。レスポンス形式を確認してください。',
      { url, contentType, retried, requestId },
    )
  }
}

export async function cmsGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const abortRelay = () => controller.abort()

    if (signal) {
      if (signal.aborted) controller.abort()
      else signal.addEventListener('abort', abortRelay, { once: true })
    }

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })

      clearTimeout(timeout)
      signal?.removeEventListener('abort', abortRelay)

      if (!res.ok) {
        if (attempt < MAX_RETRIES && RETRYABLE_STATUS.has(res.status)) {
          await wait(getBackoffMs(attempt + 1))
          continue
        }
        const body = await res.text().catch(() => '')
        throw new CmsApiError(res.status, res.statusText, `[CMS] ${res.status} ${res.statusText}`, {
          url,
          contentType: res.headers.get('content-type') ?? 'unknown',
          responseSnippet: body.slice(0, 220).trim() || undefined,
          retried: attempt,
          requestId: res.headers.get('x-request-id'),
        })
      }

      return await parseJsonOrThrow<T>(res, url, attempt)
    } catch (error) {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', abortRelay)

      if (error instanceof CmsApiError) throw error
      if (attempt < MAX_RETRIES) {
        await wait(getBackoffMs(attempt + 1))
        continue
      }
      throw new CmsApiError(0, 'NetworkError', '[CMS] ネットワークエラーが発生しました。', {
        url,
        contentType: 'unknown',
        retried: attempt,
      })
    }
  }

  throw new CmsApiError(0, 'Unknown', '[CMS] 予期しないエラーです。', {
    url,
    contentType: 'unknown',
    retried: MAX_RETRIES,
  })
}
