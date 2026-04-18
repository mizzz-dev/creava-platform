import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHead from '@/components/seo/PageHead'
import ErrorState from '@/components/common/ErrorState'
import { getGuideBySlug } from '@/modules/faq/guideApi'
import { ROUTES } from '@/lib/routeConstants'
import type { GuideItem } from '@/types'

export default function SupportGuideDetailPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const [item, setItem] = useState<GuideItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuide = () => {
    setLoading(true)
    setError(null)
    getGuideBySlug(slug)
      .then((res) => setItem(res ?? null))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : t('support.loadError'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGuide()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <PageHead title={`${item?.seoTitle ?? item?.title ?? t('support.guideFallbackTitle')} | mizzz`} description={item?.seoDescription ?? item?.summary ?? t('support.description')} />
      <Link to={ROUTES.SUPPORT_CENTER} className="text-xs text-violet-500 hover:text-violet-400">← {t('support.backToSupport')}</Link>

      {loading && <p className="mt-6 text-sm text-gray-500">Loading...</p>}
      {error && <ErrorState message={error} onRetry={fetchGuide} location="support_guide_detail" />}

      {!loading && !error && item && (
        <>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-gray-100">{item.title}</h1>
          {item.summary && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{item.summary}</p>}
          <div className="prose prose-sm mt-8 max-w-none dark:prose-invert whitespace-pre-wrap text-gray-700 dark:text-gray-200">{item.body}</div>
        </>
      )}

      {!loading && !error && !item && <p className="mt-6 text-sm text-gray-500">{t('support.guideNotFound')}</p>}
    </article>
  )
}
