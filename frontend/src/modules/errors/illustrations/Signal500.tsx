import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ErrorSiteVariant } from '@/modules/errors/siteVariants'

interface Props {
  variant: ErrorSiteVariant
}

/**
 * 500 用 - 切れた信号と "回復しようとする" ハートビート。
 *
 * - 上半分: 信号アーチが断続的に消える/戻る
 * - 真ん中: バツ印 (障害)
 * - 下半分: ECG ライン（弱→強→弱を繰り返し、"持ち直そうとする" 雰囲気）
 *
 * 不安にさせすぎないよう、red はあくまでアクセントに留める。
 */
export default function Signal500({ variant }: Props) {
  const prefersReduced = useReducedMotion()
  const [pulse, setPulse] = useState(0)

  // ECG をループで動かすため一定間隔で再キーする
  useEffect(() => {
    if (prefersReduced) return
    const t = window.setInterval(() => setPulse(v => (v + 1) % 1000), 4200)
    return () => window.clearInterval(t)
  }, [prefersReduced])

  return (
    <motion.div
      className="relative mx-auto mb-8 h-28 w-28"
      animate={prefersReduced ? {} : { y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 96" fill="none" className="h-full w-full">
        {/* signal arcs */}
        {[12, 22, 32, 42].map((r, i) => (
          <motion.path
            key={r}
            d={`M${48 - r * 0.7} ${50 + r * 0.1} A${r} ${r} 0 0 1 ${48 + r * 0.7} ${50 + r * 0.1}`}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={i < 2 ? variant.illustration : variant.illustrationSoft}
            animate={prefersReduced ? {} : { opacity: i < 2 ? [0.4, 0.85, 0.4] : [0.1, 0.35, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        {/* dot at antenna base */}
        <motion.circle
          cx="48"
          cy="58"
          r="3"
          fill="currentColor"
          className={variant.illustration}
          animate={prefersReduced ? {} : { scale: [1, 1.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* x mark — appears with spring */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <line x1="38" y1="20" x2="58" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-400/55 dark:text-red-400/40" />
          <line x1="58" y1="20" x2="38" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-400/55 dark:text-red-400/40" />
        </motion.g>

        {/* ECG-like reassurance line */}
        <motion.path
          key={pulse}
          d="M10 80 L26 80 L32 70 L38 88 L46 64 L54 84 L62 80 L86 80"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={variant.illustration}
          initial={prefersReduced ? false : { pathLength: 0, opacity: 0.35 }}
          animate={prefersReduced ? {} : { pathLength: 1, opacity: [0.35, 1, 0.6] }}
          transition={{ duration: 2.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
    </motion.div>
  )
}
