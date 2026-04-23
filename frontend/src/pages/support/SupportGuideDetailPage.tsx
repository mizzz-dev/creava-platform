import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHead from '@/components/seo/PageHead'
import ErrorState from '@/components/common/ErrorState'
import { getGuideBySlug } from '@/modules/faq/guideApi'
import { getFaqList } from '@/modules/faq/api'
import { ROUTES } from '@/lib/routeConstants'
import type { FAQItem, GuideItem } from '@/types'
import { useStrapiCollection } from '@/hooks'
import { isFanclubSite, isStoreSite } from '@/lib/siteLinks'
import { trackDeflectionState, trackKnowledgeArticleView, trackKnowledgeFeedback } from '@/modules/support/knowledgeOps'

export default function SupportGuideDetailPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const [item, setItem] = useState<GuideItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items: faqItems } = useStrapiCollection<FAQItem>(() => getFaqList())
  const sourceSite = isStoreSite ? 'store' : isFanclubSite ? 'fc' : 'main'

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

  useEffect(() => {
    if (!item) return
    trackKnowledgeArticleView({
      sourceSite,
      articleType: 'guide',
      articleSlug: item.slug,
      category: item.category,
    })
    trackDeflectionState({
      sourceSite,
      deflectionState: 'article_viewed',
      articleType: 'guide',
      category: item.category,
    })
  }, [item, sourceSite])

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

          <section className="mt-10 grid gap-4 rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('support.relatedFaq')}</h2>
              <ul className="mt-3 space-y-2">
                {(item.relatedFAQs ?? []).slice(0, 4).map((faq) => (
                  <li key={faq.id} className="text-sm text-gray-600 dark:text-gray-300">
                    • {faq.question}
                  </li>
                ))}
                {(item.relatedFAQs ?? []).length === 0 && <li className="text-sm text-gray-500">{t('support.noRelatedFaq')}</li>}
              </ul>
              <Link to={ROUTES.FAQ} className="mt-3 inline-flex text-xs text-violet-500 hover:text-violet-400">{t('support.toFaq')}</Link>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('support.recommendedFaq')}</h2>
              <ul className="mt-3 space-y-2">
                {(faqItems ?? [])
                  .filter((faq) => faq.sourceSite === item.sourceSite || faq.sourceSite === 'all')
                  .slice(0, 4)
                  .map((faq) => (
                    <li key={faq.id} className="text-sm text-gray-600 dark:text-gray-300">
                      • {faq.question}
                    </li>
                  ))}
              </ul>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 text-xs dark:border-cyan-900/60 dark:bg-cyan-950/20">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{t('support.articleFeedbackTitle')}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-full border border-emerald-300 px-3 py-1 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
                onClick={() => {
                  if (!item) return
                  trackKnowledgeFeedback({ sourceSite, articleType: 'guide', articleSlug: item.slug, category: item.category, feedbackState: 'helpful' })
                  trackDeflectionState({ sourceSite, deflectionState: 'article_helpful', articleType: 'guide', category: item.category })
                }}
              >
                {t('support.articleFeedbackHelpful')}
              </button>
              <button
                type="button"
                className="rounded-full border border-rose-300 px-3 py-1 text-rose-700 dark:border-rose-700 dark:text-rose-300"
                onClick={() => {
                  if (!item) return
                  trackKnowledgeFeedback({ sourceSite, articleType: 'guide', articleSlug: item.slug, category: item.category, feedbackState: 'not_helpful' })
                }}
              >
                {t('support.articleFeedbackNotHelpful')}
              </button>
              <Link
                to={ROUTES.CONTACT}
                className="rounded-full border border-violet-300 px-3 py-1 text-violet-700 dark:border-violet-700 dark:text-violet-300"
                onClick={() => trackDeflectionState({ sourceSite, deflectionState: 'still_need_support', articleType: 'guide', category: item.category })}
              >
                {t('support.articleFeedbackContact')}
              </Link>
            </div>
          </section>
        </>
      )}

      {!loading && !error && !item && <p className="mt-6 text-sm text-gray-500">{t('support.guideNotFound')}</p>}
    </article>
  )
}
