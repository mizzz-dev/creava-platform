import type { NotificationInboxResponse } from './inboxTypes'

function parseJsonOrThrow(response: Response, label: string) {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return response.text().then((raw) => {
      throw new Error(`${label} content-type が不正です: ${contentType} (${raw.slice(0, 120)})`)
    })
  }
  return response.json()
}

async function callNotificationApi<T>(authToken: string, path: string, init?: RequestInit): Promise<T> {
  const baseUrl = import.meta.env.VITE_STRAPI_API_URL
  if (!baseUrl) throw new Error('VITE_STRAPI_API_URL が未設定です。')

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`notification API error: ${response.status}`)
  }

  return parseJsonOrThrow(response, path) as Promise<T>
}

export async function getNotificationInbox(authToken: string): Promise<NotificationInboxResponse> {
  return callNotificationApi<NotificationInboxResponse>(authToken, '/api/user-sync/notifications/inbox')
}

export async function markMessageRead(authToken: string, messageId: string): Promise<void> {
  await callNotificationApi<{ ok: boolean }>(authToken, `/api/user-sync/notifications/messages/${encodeURIComponent(messageId)}/read`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function archiveMessage(authToken: string, messageId: string): Promise<void> {
  await callNotificationApi<{ ok: boolean }>(authToken, `/api/user-sync/notifications/messages/${encodeURIComponent(messageId)}/archive`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function dismissMessage(authToken: string, messageId: string): Promise<void> {
  await callNotificationApi<{ ok: boolean }>(authToken, `/api/user-sync/notifications/messages/${encodeURIComponent(messageId)}/dismiss`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
