import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { trackMizzzEvent } from '@/modules/analytics/tracking'

export default function NetworkStatusToast() {
  const { t } = useTranslation()
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(window.navigator.onLine)

    const onOffline = () => {
      setOnline(false)
      trackMizzzEvent('offline_fallback_view')
    }
    const onOnline = () => setOnline(true)

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed inset-x-3 top-20 z-[60] rounded-xl border border-amber-300/60 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-lg dark:border-amber-400/40 dark:bg-amber-900/85 dark:text-amber-100">
      <p>{t('pwa.offlineMessage')}</p>
    </div>
  )
}
