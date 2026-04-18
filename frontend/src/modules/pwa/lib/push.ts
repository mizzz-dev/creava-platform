const VAPID_PUBLIC_KEY = (import.meta.env.VITE_WEB_PUSH_VAPID_PUBLIC_KEY as string | undefined) ?? ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}

export async function supportsWebPush(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission()
}

export async function subscribeWebPush(): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) return null
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  })
}
