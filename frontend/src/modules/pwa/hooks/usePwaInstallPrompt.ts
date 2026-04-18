import { useEffect, useMemo, useState } from 'react'
import { trackMizzzEvent } from '@/modules/analytics/tracking'
import {
  canShowInstallPrompt,
  detectInstallGuidancePlatform,
  isStandaloneMode,
  markInstallPromptDismissed,
  markInstallPromptShown,
  type DeferredInstallPromptEvent,
} from '@/modules/pwa/lib/installPrompt'
import { SITE_TYPE } from '@/lib/siteLinks'

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandaloneMode()) return

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as DeferredInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)

      if (canShowInstallPrompt()) {
        setVisible(true)
        markInstallPromptShown()
        trackMizzzEvent('pwa_install_prompt_impression', { sourceSite: SITE_TYPE })
      }
    }

    const onInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
      trackMizzzEvent('pwa_install_success', { sourceSite: SITE_TYPE })
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const platform = useMemo(() => detectInstallGuidancePlatform(), [])

  const install = async () => {
    if (!deferredPrompt) return
    trackMizzzEvent('pwa_install_prompt_click', { sourceSite: SITE_TYPE, platform })
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'dismissed') {
      trackMizzzEvent('pwa_install_dismiss', { sourceSite: SITE_TYPE, platform })
      markInstallPromptDismissed()
      setVisible(false)
    }
    if (choice.outcome === 'accepted') {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  const dismiss = () => {
    markInstallPromptDismissed()
    setVisible(false)
    trackMizzzEvent('pwa_install_dismiss', { sourceSite: SITE_TYPE, platform })
  }

  return {
    visible,
    platform,
    canDirectInstall: Boolean(deferredPrompt),
    install,
    dismiss,
  }
}
