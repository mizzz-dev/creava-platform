/**
 * SurpriseCard
 * クリックで開く小さな発見カード。
 * - 折りたたみ状態から展開するアニメーション
 * - 週替わりコンテンツと組み合わせて使える
 * - 「押してみたくなる」デザインを意識
 */
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { trackPlayfulInteraction } from '../tracking'

interface Props {
  /** 展開前のラベル */
  teaser: string
  /** 展開後に表示するタイトル */
  title: string
  /** 展開後に表示するテキスト */
  body: string
  /** オプションリンク */
  href?: string
  /** オプションCTAラベル */
  ctaLabel?: string
  location?: string
  className?: string
  /** 週替わり・日替わりラベル */
  periodLabel?: string
}

export default function SurpriseCard({
  teaser,
  title,
  body,
  href,
  ctaLabel,
  location = 'surprise_card',
  className = '',
  periodLabel,
}: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    trackPlayfulInteraction(
      next ? 'surprise_card_open' : 'surprise_card_close',
      location,
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-dashed border-gray-300/80 bg-white/70 dark:border-gray-700/60 dark:bg-gray-900/50 ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          {periodLabel && (
            <span className="rounded-full border border-gray-200 bg-gray-100/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {periodLabel}
            </span>
          )}
          <span className="text-sm text-gray-600 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100">
            {teaser}
          </span>
        </div>

        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="shrink-0 text-lg leading-none text-gray-400 dark:text-gray-500"
          aria-hidden
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-gray-200/60 px-4 pb-4 pt-3.5 dark:border-gray-700/50">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {body}
              </p>
              {href && (
                <a
                  href={href}
                  onClick={() =>
                    trackPlayfulInteraction('weekly_pickup_click', location)
                  }
                  className="mt-3 inline-flex items-center gap-1 text-[11px] text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {ctaLabel ?? t('common.viewDetails', { defaultValue: '詳細を見る' })}
                  <span aria-hidden>→</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
