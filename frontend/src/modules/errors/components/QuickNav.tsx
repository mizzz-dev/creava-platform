import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import type { ErrorNavLink } from '@/modules/errors/siteAwareNav'

interface Props {
  links: ErrorNavLink[]
  /** ハイライト色用のクラス（hover 時 border, ring に使う） */
  accentBorder: string
  /** 1行に並べる列数の指定（省略時は links.length に応じて自動） */
  cols?: 2 | 3 | 4
  /** クリック時のコールバック（解析） */
  onLinkClick?: (link: ErrorNavLink) => void
  /** stagger 開始遅延 */
  delayBase?: number
}

/**
 * site-aware quick nav grid。tilt + accent border + stagger reveal。
 */
export default function QuickNav({ links, accentBorder, cols, onLinkClick, delayBase = 0.4 }: Props) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()

  const colCount = cols ?? (links.length > 3 ? 4 : 3)
  const gridClass = colCount === 4 ? 'grid-cols-2 sm:grid-cols-4' : colCount === 3 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <motion.div
      className={`mb-8 grid gap-3 ${gridClass}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayBase, duration: 0.4 }}
    >
      {links.map((link, i) => (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delayBase + 0.06 + i * 0.07, duration: 0.35 }}
          whileHover={prefersReduced ? undefined : { y: -4 }}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          className="group/card"
        >
          <Link
            to={link.to}
            onClick={() => onLinkClick?.(link)}
            className={`relative flex h-full flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:shadow-md dark:border-white/[0.07] dark:bg-white/[0.03] ${accentBorder}`}
          >
            {/* hover gradient sheen */}
            {!prefersReduced && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/40 to-white/0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 dark:via-white/[0.04]"
              />
            )}
            <span className="relative text-lg opacity-65 transition-opacity group-hover/card:opacity-100">{link.icon}</span>
            <span className="relative text-xs font-medium text-gray-700 transition-colors dark:text-white/65 group-hover/card:text-gray-900 dark:group-hover/card:text-white/90">
              {t(link.labelKey, { defaultValue: link.labelFallback })}
            </span>
            <span className="relative hidden text-[10px] text-gray-400 dark:text-white/25 sm:block">
              {t(link.descKey, { defaultValue: link.descFallback })}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
