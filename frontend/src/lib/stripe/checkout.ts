import { cmsGet, CmsApiError } from '@/lib/cms/client'

function getPaymentsApiBase(): string {
  if (import.meta.env.VITE_CMS_PROVIDER === 'wordpress') {
    const wp = import.meta.env.VITE_WORDPRESS_API_URL
    if (!wp) throw new Error('VITE_WORDPRESS_API_URL が未設定です。')
    return wp.replace(/\/$/, '')
  }

  const strapi = import.meta.env.VITE_STRAPI_API_URL
  if (!strapi) throw new Error('VITE_STRAPI_API_URL が未設定です。')
  return `${strapi.replace(/\/$/, '')}/api/payments`
}

export async function postPaymentsJson<T>(
  path: string,
  body: unknown,
  authToken?: string | null,
): Promise<T> {
  const base = getPaymentsApiBase()
  const url = `${base}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new CmsApiError(res.status, res.statusText, text || `[payments] ${res.status}`)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '')
    throw new CmsApiError(res.status, res.statusText, '[payments] JSON 以外のレスポンスです。', {
      url,
      contentType,
      responseSnippet: text.slice(0, 180),
      retried: 0,
    })
  }

  return res.json() as Promise<T>
}

export { cmsGet }
