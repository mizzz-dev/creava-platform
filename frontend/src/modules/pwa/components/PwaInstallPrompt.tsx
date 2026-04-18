import { useTranslation } from 'react-i18next'
import { usePwaInstallPrompt } from '@/modules/pwa/hooks/usePwaInstallPrompt'

export default function PwaInstallPrompt() {
  const { t } = useTranslation()
  const { visible, platform, canDirectInstall, install, dismiss } = usePwaInstallPrompt()

  if (!visible) return null

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[70] rounded-2xl border border-cyan-400/40 bg-gray-900/95 p-4 text-white shadow-2xl backdrop-blur md:inset-x-auto md:right-4 md:w-[360px] dark:border-cyan-300/30">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{t('pwa.installBadge')}</p>
      <h2 className="mt-1 text-sm font-semibold">{t('pwa.installTitle')}</h2>
      <p className="mt-1 text-xs text-gray-200">{t(`pwa.installHint.${platform}`)}</p>
      <div className="mt-3 flex items-center gap-2">
        {canDirectInstall ? (
          <button
            type="button"
            onClick={() => void install()}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-cyan-300"
          >
            {t('pwa.installAction')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-gray-400 px-3 py-2 text-xs text-gray-100 transition hover:border-gray-200"
        >
          {t('pwa.installLater')}
        </button>
      </div>
    </aside>
  )
}
