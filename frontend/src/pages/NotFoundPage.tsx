import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { ROUTES } from '@/lib/routeConstants'
import PageHead from '@/components/seo/PageHead'
import { trackCtaClick, trackErrorPageCta, trackErrorPageView, trackPlayfulInteraction } from '@/modules/analytics/tracking'
import { useErrorPageContent } from '@/modules/errors/useErrorPageContent'
import { getCrossSiteLinks, getErrorPageNavLinks, getSiteLabel } from '@/modules/errors/siteAwareNav'
import { getErrorVariant, getSiteKind } from '@/modules/errors/siteVariants'
import { isFanclubSite, isStoreSite } from '@/lib/siteLinks'
import ErrorScene from '@/modules/errors/components/ErrorScene'
import ErrorCodeDisplay from '@/modules/errors/components/ErrorCodeDisplay'
import QuickNav from '@/modules/errors/components/QuickNav'
import RevealTitle from '@/modules/errors/components/RevealTitle'
import Compass404 from '@/modules/errors/illustrations/Compass404'

/* ── Main 404 page ──────────────────────────────── */
export default function NotFoundPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const prefersReduced = useReducedMotion()
  const content = useErrorPageContent('404')
  const navLinks = getErrorPageNavLinks()
  const siteLabel = getSiteLabel()
  const site = getSiteKind()
  const variant = getErrorVariant('404', site)
  const cross = getCrossSiteLinks()

  useEffect(() => {
    trackErrorPageView('404', { site: siteLabel, pathname })
  }, [siteLabel, pathname])

  const handlePrimaryHome = () => {
    trackCtaClick('404_page', 'back_home_click', { site: siteLabel })
    trackErrorPageCta('404', 'home', { site: siteLabel })
  }
  const handleContact = () => {
    trackCtaClick('404_page', 'contact_click', { site: siteLabel })
    trackErrorPageCta('404', 'contact', { site: siteLabel })
  }

  return (
    <ErrorScene variant={variant}>
      <PageHead title="404" noindex />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        <Compass404
          variant={variant}
          onTap={() => trackPlayfulInteraction('compass_spin', '404_page', { site: siteLabel })}
        />

        <motion.p
          className={`mb-5 font-mono text-[10px] uppercase tracking-[0.3em] ${variant.eyebrow}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          {t('error.eyebrow.notFound', { defaultValue: '404 · not found' })} · {siteLabel}
        </motion.p>

        <ErrorCodeDisplay code="404" ghostColor={variant.codeGhost} glitch magnetic />

        <motion.div
          className="mb-8 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <RevealTitle
            text={content.title}
            delay={0.32}
            className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white/85"
          />
          <p className="text-sm text-gray-500 dark:text-white/40">{content.subcopy}</p>
          <p className="break-all font-mono text-[10px] text-gray-300 dark:text-white/20">{pathname}</p>
        </motion.div>

        <QuickNav
          links={navLinks}
          accentBorder="hover:border-violet-200 dark:hover:border-violet-500/20"
          delayBase={0.45}
          onLinkClick={(link) => {
            trackCtaClick('404_page', 'nav_click', { target: link.to, site: siteLabel })
            trackErrorPageCta('404', `nav_${link.id}`, { site: siteLabel })
          }}
        />

        {/* Primary CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <motion.div whileHover={prefersReduced ? undefined : { y: -2 }} whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
            <Link
              to={ROUTES.HOME}
              onClick={handlePrimaryHome}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-700 dark:border-white/[0.10] dark:bg-white/[0.07] dark:text-white/85 dark:hover:bg-white/[0.12]"
            >
              {content.ctaHomeLabel}
              <motion.span
                animate={prefersReduced ? {} : { x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
          <motion.div whileHover={prefersReduced ? undefined : { y: -2 }} whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
            <Link
              to={ROUTES.CONTACT}
              onClick={handleContact}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-transparent dark:text-white/60 dark:hover:border-white/[0.14]"
            >
              {content.ctaContactLabel}
            </Link>
          </motion.div>
        </motion.div>

        {/* Cross-site discovery */}
        {(isStoreSite || isFanclubSite) && (
          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-gray-400 dark:text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95, duration: 0.4 }}
          >
            <span className="font-mono uppercase tracking-[0.22em]">
              {t('error.discover', { defaultValue: '他のサイトも見る' })}
            </span>
            <a
              href={cross.main}
              onClick={() => trackErrorPageCta('404', 'cross_main', { site: siteLabel })}
              className="underline-offset-4 transition-colors hover:text-gray-700 hover:underline dark:hover:text-white/60"
            >
              mizzz.jp
            </a>
            {!isStoreSite && (
              <a
                href={cross.store}
                onClick={() => trackErrorPageCta('404', 'cross_store', { site: siteLabel })}
                className="underline-offset-4 transition-colors hover:text-gray-700 hover:underline dark:hover:text-white/60"
              >
                store
              </a>
            )}
            {!isFanclubSite && (
              <a
                href={cross.fanclub}
                onClick={() => trackErrorPageCta('404', 'cross_fc', { site: siteLabel })}
                className="underline-offset-4 transition-colors hover:text-gray-700 hover:underline dark:hover:text-white/60"
              >
                fanclub
              </a>
            )}
          </motion.div>
        )}

        {/* Hint */}
        <motion.p
          className="mt-8 font-mono text-[10px] text-gray-300 dark:text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          {content.hint}
        </motion.p>
      </motion.div>
    </ErrorScene>
  )
}
