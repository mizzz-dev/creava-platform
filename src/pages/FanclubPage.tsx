import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/hooks'

export default function FanclubPage() {
  const { t } = useTranslation()
  const { user, isLoaded, isSignedIn } = useCurrentUser()

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        {t('nav.fanclub')}
      </h1>

      <div className="mt-10">
        {!isLoaded && (
          <p className="text-sm text-gray-400">{t('common.loading')}</p>
        )}

        {isLoaded && !isSignedIn && (
          <p className="text-sm text-gray-500">{t('auth.memberOnly')}</p>
        )}

        {isLoaded && isSignedIn && user && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              {t('auth.signedInAs')}{' '}
              <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                {user.email ?? '—'}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              {t('auth.role')}{' '}
              <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                {user.role}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
