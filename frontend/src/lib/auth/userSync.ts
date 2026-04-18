import { SITE_TYPE } from '@/lib/siteLinks'

const DEFAULT_TIMEOUT_MS = 10_000

function resolveApiBaseUrl(): string {
  const base = import.meta.env.VITE_STRAPI_API_URL
  if (!base) throw new Error('VITE_STRAPI_API_URL が未設定です。')
  return base.replace(/\/$/, '')
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const raw = await response.text()
    const snippet = raw.slice(0, 160)
    throw new Error(`user-sync API の content-type が不正です: ${contentType} (${snippet})`)
  }
  return response.json() as Promise<Record<string, unknown>>
}

async function postProvision(accessToken: string, locale: string): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(`${resolveApiBaseUrl()}/api/user-sync/provision`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sourceSite: SITE_TYPE,
        locale,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const raw = await response.text().catch(() => '')
      throw new Error(`user-sync provision failed: ${response.status} ${response.statusText} ${raw.slice(0, 120)}`)
    }

    await parseJson(response)
  } finally {
    clearTimeout(timeout)
  }
}

export async function provisionUserAfterLogin(getAccessToken: () => Promise<string | null>, locale: string): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) return
  await postProvision(accessToken, locale)
}
