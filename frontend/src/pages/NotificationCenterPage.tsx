import { useEffect, useState } from 'react'
import PageHead from '@/components/seo/PageHead'
import NotificationInboxCenter from '@/modules/notifications/components/NotificationInboxCenter'
import { useAuthClient } from '@/lib/auth/AuthProvider'

export default function NotificationCenterPage() {
  const authClient = useAuthClient()
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    authClient.getAccessToken()
      .then((token) => {
        if (!cancelled) setAuthToken(token)
      })
      .catch(() => {
        if (!cancelled) setAuthToken(null)
      })
    return () => {
      cancelled = true
    }
  }, [authClient])

  return (
    <>
      <PageHead title="通知センター | mizzz" description="main / store / fc をまたいだ通知を確認できる通知センターです。" />
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <NotificationInboxCenter authToken={authToken} />
      </div>
    </>
  )
}
