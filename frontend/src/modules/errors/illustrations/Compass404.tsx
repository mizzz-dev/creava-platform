import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import type { ErrorSiteVariant } from '@/modules/errors/siteVariants'
import ConfettiBurst from '@/modules/errors/components/ConfettiBurst'

interface Props {
  variant: ErrorSiteVariant
  /** タップで spin した時に呼ばれる（解析） */
  onTap?: () => void
}

/**
 * 404 用 - 迷子コンパス。
 *
 * - 通常時はゆっくり方位針が回転
 * - タップで 720° 高速スピン + コンフェッティ
 * - 周囲に小さな足跡 dot がループ
 * - hover で外周ハロー強調
 */
export default function Compass404({ variant, onTap }: Props) {
  const prefersReduced = useReducedMotion()
  const [boost, setBoost] = useState(0)

  const handleTap = () => {
    if (!prefersReduced) setBoost(v => v + 1)
    onTap?.()
  }

  return (
    <div className="relative mx-auto mb-8 h-32 w-32">
      <ConfettiBurst trigger={boost} size={180} />

      {/* footstep trail */}
      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map(i => {
            const angle = (i / 6) * Math.PI * 2
            const r = 56
            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r
            return (
              <motion.span
                key={i}
                className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full ${variant.sparkBg}`}
                style={{ marginLeft: -3, marginTop: -3, x, y }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              />
            )
          })}
        </div>
      )}

      <motion.button
        type="button"
        onClick={handleTap}
        className="group relative block h-full w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
        aria-label="compass"
        animate={prefersReduced ? {} : { y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={prefersReduced ? undefined : { scale: 1.05 }}
        whileTap={prefersReduced ? undefined : { scale: 0.95 }}
      >
        <svg viewBox="0 0 96 96" fill="none" className="h-full w-full">
          <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="1.5" className={variant.illustrationSoft} />
          <circle cx="48" cy="48" r="30" stroke="currentColor" strokeWidth="1" className={variant.illustrationSoft} />

          <motion.circle
            cx="48" cy="48" r="42"
            stroke="currentColor" strokeWidth="0.8"
            className={`${variant.illustration} opacity-0 group-hover:opacity-60`}
            animate={prefersReduced ? {} : { opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.g
            key={boost}
            animate={prefersReduced ? {} : { rotate: [0, boost ? 720 : 360] }}
            transition={{ duration: boost ? 2.2 : 8, repeat: boost ? 0 : Infinity, ease: boost ? [0.22, 1, 0.36, 1] : 'easeInOut' }}
            style={{ originX: '48px', originY: '48px' }}
          >
            <path d="M48 22 L51 48 L48 58 L45 48 Z" fill="currentColor" className={variant.illustration} />
            <path d="M48 74 L51 48 L48 38 L45 48 Z" fill="currentColor" className="text-gray-300/70 dark:text-white/15" />
          </motion.g>

          <circle cx="48" cy="48" r="3" fill="currentColor" className="text-gray-400 dark:text-white/30" />

          {[0, 90, 180, 270].map(deg => (
            <text
              key={deg}
              x="48"
              y="16"
              textAnchor="middle"
              fontSize="7"
              fill="currentColor"
              className="font-mono text-gray-300 dark:text-white/20"
              transform={`rotate(${deg} 48 48)`}
            >
              {['N', 'E', 'S', 'W'][deg / 90]}
            </text>
          ))}
        </svg>
      </motion.button>
    </div>
  )
}
