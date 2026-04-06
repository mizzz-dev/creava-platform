import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PageHead from '@/components/seo/PageHead'
import { ROUTES } from '@/lib/routeConstants'
import {
  isMainSite,
  legacyFanclubRedirectTo,
  legacyStoreRedirectTo,
} from '@/lib/siteLinks'

type Props = {
  target: 'store' | 'fanclub'
}

export default function LegacySubdomainRedirectPage({ target }: Props) {
  const { pathname, search } = useLocation()

  if (!isMainSite) {
    return <Navigate to={target === 'store' ? ROUTES.STORE : ROUTES.FANCLUB} replace />
  }

  const redirectTo = target === 'store'
    ? legacyStoreRedirectTo(pathname, search)
    : legacyFanclubRedirectTo(pathname, search)

  useEffect(() => {
    window.location.replace(redirectTo)
  }, [redirectTo])

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <PageHead
        title={target === 'store' ? 'Store に移動します' : 'Fanclub に移動します'}
        description={target === 'store' ? 'store.mizzz.jp へ移動します。' : 'fc.mizzz.jp へ移動します。'}
        noindex
      />
      <p className="text-sm text-gray-500">新しいサブドメインへ移動しています…</p>
      <p className="mt-3">
        <a className="text-violet-500 hover:text-violet-400" href={redirectTo}>
          移動しない場合はこちら
        </a>
      </p>
    </main>
  )
}
