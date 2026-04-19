import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ResponsiveImage from '@/components/common/ResponsiveImage'
import type { SiteSettings, StrapiMedia } from '@/types'
import { getMediaUrl } from '@/utils'

export type VisualShowcaseSite = 'main' | 'store' | 'fanclub'

interface VisualItem {
  id: string
  title: string
  caption: string
  image: string | null
  alt: string
  href?: string
  badge?: string
}

interface Props {
  site: VisualShowcaseSite
  settings?: SiteSettings | null
  className?: string
  primaryCta?: { label: string; to: string }
}

const SITE_ACCENT: Record<VisualShowcaseSite, string> = {
  main: 'from-violet-100/80 via-white to-cyan-100/80 dark:from-violet-900/30 dark:via-[#0b0b14] dark:to-cyan-900/30',
  store: 'from-indigo-100/80 via-white to-sky-100/80 dark:from-indigo-900/35 dark:via-[#0b0b14] dark:to-cyan-900/25',
  fanclub: 'from-fuchsia-100/80 via-white to-violet-100/80 dark:from-fuchsia-900/35 dark:via-[#0b0b14] dark:to-violet-900/25',
}

function resolveAlt(media: StrapiMedia | null | undefined, fallback: string, settings?: SiteSettings | null): string {
  return media?.alternativeText?.trim() || settings?.imageAltDefault?.trim() || fallback
}

function buildVisualItems(site: VisualShowcaseSite, settings?: SiteSettings | null, t?: (key: string, options?: { defaultValue: string }) => string): VisualItem[] {
  const translate = t ?? ((_: string, options?: { defaultValue: string }) => options?.defaultValue ?? '')
  const collection = (settings?.collectionHeroImages ?? []).slice(0, 3)

  const mappedCollection = collection.map((media, index): VisualItem => ({
    id: `${site}-collection-${media.id ?? index}`,
    title: translate(`visuals.${site}.collectionTitle${index + 1}`, { defaultValue: translate(`visuals.${site}.collectionTitle`, { defaultValue: 'Featured Visual' }) }),
    caption: translate(`visuals.${site}.collectionCaption${index + 1}`, { defaultValue: translate('visuals.collectionCaptionDefault', { defaultValue: 'CMS から差し替え可能な注目ビジュアル枠です。' }) }),
    image: getMediaUrl(media, 'large'),
    alt: resolveAlt(media, translate('visuals.altDefault', { defaultValue: 'mizzz visual asset' }), settings),
    badge: translate('visuals.badgeCollection', { defaultValue: 'COLLECTION' }),
  }))

  const featuredMedia = [
    { media: settings?.featuredImage ?? null, id: 'featured', key: 'feature' },
    { media: settings?.pickupImage ?? null, id: 'pickup', key: 'pickup' },
    { media: settings?.campaignImage ?? null, id: 'campaign', key: 'campaign' },
  ].map((entry): VisualItem => ({
    id: `${site}-${entry.id}`,
    title: translate(`visuals.${site}.${entry.key}Title`, { defaultValue: translate(`visuals.${entry.key}Title`, { defaultValue: entry.id }) }),
    caption: translate(`visuals.${site}.${entry.key}Caption`, { defaultValue: translate(`visuals.${entry.key}Caption`, { defaultValue: '季節施策やキャンペーンで差し替えしやすい枠。' }) }),
    image: getMediaUrl(entry.media, 'large'),
    alt: resolveAlt(entry.media, translate('visuals.altDefault', { defaultValue: 'mizzz visual asset' }), settings),
    badge: entry.id === 'campaign' ? translate('visuals.badgeCampaign', { defaultValue: 'CAMPAIGN' }) : translate('visuals.badgeFeatured', { defaultValue: 'FEATURED' }),
  }))

  return [...mappedCollection, ...featuredMedia].slice(0, 4)
}

export default function CmsVisualShowcaseSection({ site, settings, className = '', primaryCta }: Props) {
  const { t } = useTranslation()
  const items = buildVisualItems(site, settings, t)

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-[var(--ds-color-border-subtle)] bg-gradient-to-br ${SITE_ACCENT[site]} p-4 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ds-color-fg-subtle)]">
            {t(`visuals.${site}.eyebrow`, { defaultValue: 'visual direction' })}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ds-color-fg-default)] sm:text-2xl">
            {t(`visuals.${site}.title`, { defaultValue: t('visuals.titleDefault', { defaultValue: 'Visual Highlights' }) })}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ds-color-fg-muted)]">
            {t(`visuals.${site}.lead`, { defaultValue: t('visuals.leadDefault', { defaultValue: '画像が無くても成立し、CMS 差し替え時は訴求力が上がる構成です。' }) })}
          </p>
        </div>
        {primaryCta && (
          <Link
            to={primaryCta.to}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-color-border-default)] bg-[var(--ds-color-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--ds-color-fg-default)] transition hover:-translate-y-0.5"
          >
            {primaryCta.label} →
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <ResponsiveImage
              src={item.image}
              alt={item.alt}
              aspectRatio="16/10"
              mobileAspectRatio="4/3"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 45vw, 92vw"
              className="w-full"
              fallbackClassName="bg-gradient-to-br from-white via-gray-50 to-violet-50 dark:from-[#121220] dark:via-[#0f0f1a] dark:to-[#1a1330]"
              fallback={
                <div className="flex flex-col items-center gap-2 opacity-70">
                  <span className="font-display text-2xl font-bold text-black/20 dark:text-white/20">mizzz</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/35 dark:text-white/35">
                    {t('visuals.fallbackLabel', { defaultValue: 'fallback visual' })}
                  </span>
                </div>
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent opacity-75 transition-opacity group-hover:opacity-95" />
            <div className="absolute inset-x-0 bottom-0 z-[1] p-4">
              {item.badge && (
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/90">
                  {item.badge}
                </span>
              )}
              <h3 className="mt-2 text-sm font-semibold text-white sm:text-base">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/80 sm:text-sm">{item.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
