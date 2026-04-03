import { useTranslation } from 'react-i18next'
import { useStrapiCollection, useContentAccess } from '@/hooks'
import { getWorksList } from '@/modules/works/api'
import { getMediaUrl } from '@/utils'
import { detailPath } from '@/lib/routeConstants'
import PageHead from '@/components/seo/PageHead'
import WorkCard from '@/components/cards/WorkCard'
import ErrorState from '@/components/common/ErrorState'
import type { Work } from '@/types'

function WorksGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton aspect-square bg-gray-100" />
          <div className="skeleton h-3 w-3/4 rounded bg-gray-100" />
          <div className="skeleton h-3 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

export default function WorksPage() {
  const { t } = useTranslation()
  const { filterVisible } = useContentAccess()

  const { items, loading, error } = useStrapiCollection<Work>(
    () => getWorksList({ pagination: { pageSize: 40 } }),
  )

  const visibleItems = items ? filterVisible(items) : null

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <PageHead title={t('nav.works')} description={t('seo.works')} />

      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-300">
          <span className="mr-1 text-gray-200">//</span>
          {t('nav.works')}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
          {t('nav.works')}
        </h1>
      </header>

      {loading && <WorksGridSkeleton />}
      {error && <ErrorState message={error} />}

      {!loading && !error && visibleItems !== null && visibleItems.length === 0 && (
        <p className="text-sm text-gray-400">{t('access.noContent')}</p>
      )}

      {visibleItems && visibleItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visibleItems.map((item, i) => (
            <WorkCard
              key={item.id}
              title={item.title}
              href={detailPath.work(item.slug)}
              category={item.category}
              thumbnailUrl={getMediaUrl(item.thumbnail, 'small') ?? getMediaUrl(item.thumbnail)}
              index={i}
              isFeatured={item.isFeatured}
              status={item.accessStatus}
            />
          ))}
        </div>
      )}
    </section>
  )
}
