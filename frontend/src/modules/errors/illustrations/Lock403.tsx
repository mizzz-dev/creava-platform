import { motion, useReducedMotion } from 'framer-motion'
import type { ErrorSiteVariant } from '@/modules/errors/siteVariants'

interface Props {
  variant: ErrorSiteVariant
}

/**
 * 403 用 - 鍵と鍵穴。
 *
 * - 鍵が右側からスッと現れて鍵穴の方に近づき、戻る
 * - 鍵穴自体は kinda glow する
 * - 周囲に小さな sparkle
 */
export default function Lock403({ variant }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      className="relative mx-auto mb-8 h-28 w-28"
      animate={prefersReduced ? {} : { y: [0, -4, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 96" fill="none" className="h-full w-full">
        {/* shackle */}
        <motion.path
          d="M32 46 V36 A16 16 0 0 1 64 36 V46"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={variant.illustration}
          animate={prefersReduced ? {} : { y: [0, -2, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* body */}
        <rect x="26" y="46" width="44" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" className={variant.illustrationSoft} />
        <rect x="26" y="46" width="44" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" className={variant.illustration} />

        {/* keyhole with subtle pulse */}
        <motion.g
          animate={prefersReduced ? {} : { opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="48" cy="60" r="3.5" fill="currentColor" className={variant.illustration} />
          <path d="M48 63 L48 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={variant.illustration} />
        </motion.g>

        {/* approaching key */}
        <motion.g
          initial={{ x: 22, opacity: 0 }}
          animate={prefersReduced ? { x: 0, opacity: 1 } : { x: [22, 4, 22], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        >
          <circle cx="80" cy="60" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-amber-400/70 dark:text-amber-300/65" />
          <line x1="76" y1="60" x2="68" y2="60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-amber-400/70 dark:text-amber-300/65" />
          <line x1="70" y1="60" x2="70" y2="64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-amber-400/70 dark:text-amber-300/65" />
          <line x1="73" y1="60" x2="73" y2="64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-amber-400/70 dark:text-amber-300/65" />
        </motion.g>

        {/* sparkles */}
        <motion.circle
          cx="22" cy="36" r="1.4"
          fill="currentColor" className="text-amber-300/55 dark:text-amber-300/45"
          animate={prefersReduced ? {} : { opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="74" cy="40" r="1.6"
          fill="currentColor" className="text-amber-300/55 dark:text-amber-300/45"
          animate={prefersReduced ? {} : { opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  )
}
