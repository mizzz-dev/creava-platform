import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ROUTES } from '@/lib/routeConstants'
import PageHead from '@/components/seo/PageHead'
import { trackCtaClick, trackErrorPageCta, trackErrorPageView, trackRetryClick } from '@/modules/analytics/tracking'
import { useErrorPageContent } from '@/modules/errors/useErrorPageContent'
import { getCrossSiteLinks, getErrorPageNavLinks, getSiteLabel } from '@/modules/errors/siteAwareNav'
import { getErrorVariant, getSiteKind } from '@/modules/errors/siteVariants'
import { isFanclubSite, isStoreSite } from '@/lib/siteLinks'
import ErrorScene from '@/modules/errors/components/ErrorScene'
import ErrorCodeDisplay from '@/modules/errors/components/ErrorCodeDisplay'
import QuickNav from '@/modules/errors/components/QuickNav'
import RevealTitle from '@/modules/errors/components/RevealTitle'
import Signal500 from '@/modules/errors/illustrations/Signal500'
import Maintenance503 from '@/modules/errors/illustrations/Maintenance503'
import Lock403 from '@/modules/errors/illustrations/Lock403'

interface Props {
  code?: '500' | '503' | '403'
  onRetry?: () => void
}

/* ── Pulsing dots — status indicator ───────────────── */
function SignalDots({ tone }: { tone: 'maintenance' | 'error' | 'restricted' }) {
  const dotClass =
    tone === 'maintenance'
      ? 'bg-amber-400 dark:bg-amber-300/70'
      : tone === 'restricted'
        ? 'bg-violet-400/70 dark:bg-violet-300/60'
        : 'bg-red-400/70 dark:bg-red-400/60'
  return (
    <div className="mb-5 flex items-center justify-center gap-1.5">
      {[0, 0.25, 0.5].map((delay) => (
        <motion.span
          key={delay}
          className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export default function InternalErrorPage({ code = '500', onRetry }: Props) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const is503 = code === '503'
  const is403 = code === '403'
  const content = useErrorPageContent(code)
  const siteLabel = getSiteLabel()
  const site = getSiteKind()
  const variant = getErrorVariant(code, site)
  const navLinks = getErrorPageNavLinks().slice(0, 3)
  const cross = getCrossSiteLinks()

  // retry button visual feedback
  const [retrySpin, setRetrySpin] = useState(0)

  useEffect(() => {
    trackErrorPageView(code, { site: siteLabel })
  }, [code, siteLabel])

  const tone: 'maintenance' | 'error' | 'restricted' = is503 ? 'maintenance' : is403 ? 'restricted' : 'error'

  const eyebrowFallback = is503
    ? t('error.eyebrow.maintenance', { defaultValue: 'maintenance' })
    : is403
      ? t('error.eyebrow.restricted', { defaultValue: 'restricted' })
      : t('error.eyebrow.serverError', { defaultValue: `error ${code}` })

  const handleRetry = () => {
    trackCtaClick(`${code}_page`, 'retry_click', { site: siteLabel })
    trackRetryClick(`${code}_page`, { site: siteLabel })
    trackErrorPageCta(code, 'retry', { site: siteLabel })
    setRetrySpin(v => v + 1)
    if (onRetry) {
      onRetry()
    } else {
      // 少しだけ視覚フィードバックの余韻を残す
      window.setTimeout(() => window.location.reload(), 280)
    }
  }

  const handleHome = () => {
    trackCtaClick(`${code}_page`, 'back_home_click', { site: siteLabel })
    trackErrorPageCta(code, 'home', { site: siteLabel })
  }
  const handleContact = () => {
    trackCtaClick(`${code}_page`, 'contact_click', { site: siteLabel })
    trackErrorPageCta(code, 'contact', { site: siteLabel })
  }

  return (
    <ErrorScene variant={variant} parallaxStrength={8} spotlight={!is503}>
      <PageHead title={code} noindex />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        {is503 ? <Maintenance503 variant={variant} /> : is403 ? <Lock403 variant={variant} /> : <Signal500 variant={variant} />}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <SignalDots tone={tone} />
        </motion.div>

        <motion.p
          className={`mb-4 font-mono text-[10px] uppercase tracking-[0.28em] ${variant.eyebrow}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {eyebrowFallback} · {siteLabel}
        </motion.p>

        <ErrorCodeDisplay code={code} ghostColor={variant.codeGhost} />

        {/* Message */}
        <motion.div
          className="mb-8 space-y-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <RevealTitle
            text={content.title}
            delay={0.32}
            className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white/85"
          />
          <p className="text-sm leading-relaxed text-gray-500 dark:text-white/40">{content.subcopy}</p>
          {is503 && content.maintenanceBadge && (
            <div className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${variant.chipBg}`}>
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-amber-400"
                animate={prefersReduced ? {} : { opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className={`font-mono text-[10px] tracking-wider ${variant.chipText}`}>
                {content.maintenanceBadge}
              </span>
            </div>
          )}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {!is403 && (
            <motion.button
              type="button"
              onClick={handleRetry}
              whileHover={prefersReduced ? undefined : { y: -2 }}
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-gray-900 bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-700 dark:border-white/[0.10] dark:bg-white/[0.07] dark:text-white/85 dark:hover:bg-white/[0.12]"
            >
              <motion.span
                key={retrySpin}
                animate={prefersReduced ? {} : { rotate: retrySpin > 0 ? [0, 360] : [0, 360] }}
                transition={{ duration: retrySpin > 0 ? 0.6 : 2, repeat: retrySpin > 0 ? 0 : Infinity, ease: retrySpin > 0 ? [0.22, 1, 0.36, 1] : 'linear' }}
                style={{ display: 'inline-block' }}
              >
                ↺
              </motion.span>
              <span className="relative">
                {onRetry
                  ? t('common.retry', { defaultValue: '再試行' })
                  : t('error.reload', { defaultValue: 'ページを再読み込み' })}
              </span>
              {/* sweep highlight on hover */}
              {!prefersReduced && (
                <span className="pointer-events-none absolute inset-y-0 -left-10 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
              )}
            </motion.button>
          )}
          <motion.div whileHover={prefersReduced ? undefined : { y: -2 }} whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
            <Link
              to={ROUTES.HOME}
              onClick={handleHome}
              className={
                is403
                  ? 'inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-700 dark:border-white/[0.10] dark:bg-white/[0.07] dark:text-white/85 dark:hover:bg-white/[0.12]'
                  : 'inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-transparent dark:text-white/60 dark:hover:border-white/[0.14]'
              }
            >
              {content.ctaHomeLabel}
              {is403 && (
                <motion.span
                  animate={prefersReduced ? {} : { x: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              )}
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

        {/* Site-aware quick nav — hidden on 503 to keep focus on wait */}
        {!is503 && (
          <div className="mt-8">
            <QuickNav
              links={navLinks}
              accentBorder={
                is403
                  ? 'hover:border-violet-200 dark:hover:border-violet-500/20'
                  : site === 'store'
                    ? 'hover:border-amber-200 dark:hover:border-amber-500/20'
                    : site === 'fanclub'
                      ? 'hover:border-cyan-200 dark:hover:border-cyan-500/20'
                      : 'hover:border-gray-300 dark:hover:border-white/15'
              }
              cols={3}
              delayBase={0.7}
              onLinkClick={(link) => trackErrorPageCta(code, `nav_${link.id}`, { site: siteLabel })}
            />
          </div>
        )}

        {/* Cross-site discovery */}
        {(isStoreSite || isFanclubSite) && !is503 && (
          <motion.div
            className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-gray-400 dark:text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95, duration: 0.4 }}
          >
            <span className="font-mono uppercase tracking-[0.22em]">
              {t('error.discover', { defaultValue: '他のサイトも見る' })}
            </span>
            <a href={cross.main} className="underline-offset-4 transition-colors hover:text-gray-700 hover:underline dark:hover:text-white/60" onClick={() => trackErrorPageCta(code, 'cross_main', { site: siteLabel })}>mizzz.jp</a>
            {!isStoreSite && (
              <a href={cross.store} className="underline-offset-4 transition-colors hover:text-gray-700 hover:underline dark:hover:text-white/60" onClick={() => trackErrorPageCta(code, 'cross_store', { site: siteLabel })}>store</a>
            )}
            {!isFanclubSite && (
              <a href={cross.fanclub} className="underline-offset-4 transition-colors hover:text-gray-700 hover:underline dark:hover:text-white/60" onClick={() => trackErrorPageCta(code, 'cross_fc', { site: siteLabel })}>fanclub</a>
            )}
          </motion.div>
        )}

        {/* Hint */}
        <motion.p
          className="mt-8 font-mono text-[10px] text-gray-300 dark:text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          {content.hint}
        </motion.p>
      </motion.div>
    </ErrorScene>
  )
}
