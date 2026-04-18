import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import type { ErrorSiteVariant } from '@/modules/errors/siteVariants'
import ConfettiBurst from '@/modules/errors/components/ConfettiBurst'

interface Props {
  variant: ErrorSiteVariant
}

/**
 * 503 用 - 整備中の歯車。
 *
 * - 大きな歯車がゆっくり回転
 * - 小さな歯車が反対方向に回転
 * - スパナが軽く揺れる
 * - タップで歯車が一瞬高速回転 + 火花
 * - 周囲に dust spark
 */
export default function Maintenance503({ variant }: Props) {
  const prefersReduced = useReducedMotion()
  const [boost, setBoost] = useState(0)

  const handleTap = () => {
    if (!prefersReduced) setBoost(v => v + 1)
  }

  return (
    <div className="relative mx-auto mb-8 h-28 w-28">
      <ConfettiBurst trigger={boost} size={170} />

      {/* dust sparks */}
      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[
            { top: '10%', left: '70%', delay: 0.2 },
            { top: '70%', left: '20%', delay: 1.2 },
            { top: '40%', left: '85%', delay: 2.0 },
          ].map((p, i) => (
            <motion.span
              key={i}
              className={`absolute h-1 w-1 rounded-full ${variant.sparkBg}`}
              style={{ top: p.top, left: p.left }}
              animate={{ opacity: [0, 1, 0], y: [0, -14, -28], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut', delay: p.delay }}
            />
          ))}
        </div>
      )}

      <motion.button
        type="button"
        onClick={handleTap}
        aria-label="gear"
        className="relative block h-full w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
        animate={prefersReduced ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={prefersReduced ? undefined : { scale: 1.04 }}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
      >
        <svg viewBox="0 0 96 96" fill="none" className="h-full w-full">
          {/* main big gear (slow) */}
          <motion.g
            key={`big-${boost}`}
            animate={prefersReduced ? {} : { rotate: boost ? 540 : 360 }}
            transition={{ duration: boost ? 1.4 : 18, repeat: boost ? 0 : Infinity, ease: boost ? [0.22, 1, 0.36, 1] : 'linear' }}
            style={{ originX: '40px', originY: '50px' }}
          >
            <Gear cx={40} cy={50} r={20} teeth={10} className={variant.illustration} />
            <circle cx="40" cy="50" r="5" fill="currentColor" className={variant.illustration} />
          </motion.g>

          {/* secondary smaller gear (counter rotate) */}
          <motion.g
            key={`small-${boost}`}
            animate={prefersReduced ? {} : { rotate: boost ? -540 : -360 }}
            transition={{ duration: boost ? 1.4 : 12, repeat: boost ? 0 : Infinity, ease: boost ? [0.22, 1, 0.36, 1] : 'linear' }}
            style={{ originX: '70px', originY: '32px' }}
          >
            <Gear cx={70} cy={32} r={11} teeth={8} className={variant.illustrationSoft} />
            <circle cx="70" cy="32" r="3" fill="currentColor" className={variant.illustrationSoft} />
          </motion.g>

          {/* wrench */}
          <motion.g
            animate={prefersReduced ? {} : { rotate: [0, 16, 0, -12, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ originX: '78px', originY: '78px' }}
          >
            <path d="M73 74 L84 85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={variant.illustrationSoft} />
            <circle cx="72" cy="73" r="4" stroke="currentColor" strokeWidth="1.5" className={variant.illustrationSoft} />
          </motion.g>
        </svg>
      </motion.button>
    </div>
  )
}

function Gear({ cx, cy, r, teeth, className }: { cx: number; cy: number; r: number; teeth: number; className: string }) {
  const innerR = r - 4
  const lines: JSX.Element[] = []
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * 360
    lines.push(
      <line
        key={i}
        x1={cx}
        y1={cy - r}
        x2={cx}
        y2={cy - r - 3}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className={className}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />,
    )
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth="1.5" fill="none" className={className} />
      <circle cx={cx} cy={cy} r={innerR} stroke="currentColor" strokeWidth="1" fill="none" className={className} />
      {lines}
    </g>
  )
}
