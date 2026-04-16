/**
 * AnimatedBackground
 *
 * 装飾的な背景アニメーションコンポーネント。
 * - pointer-events: none で UI を妨げない
 * - prefers-reduced-motion に対応 (variant="static" で静的表示)
 * - light / dark 両テーマで最適な透明度を CSS 変数で制御
 *
 * 使い方:
 *   <div className="relative overflow-hidden">
 *     <AnimatedBackground variant="orbs" palette="violet" />
 *     {children}
 *   </div>
 */

import { motion, useReducedMotion } from 'framer-motion'
import { motionPresets } from '@/components/common/motionPresets'

type Palette = 'violet' | 'cyan' | 'amber' | 'store' | 'fc' | 'mixed'
type Variant = 'orbs' | 'grid' | 'noise' | 'orbs-grid'

interface AnimatedBackgroundProps {
  variant?: Variant
  palette?: Palette
  intensity?: 'subtle' | 'medium' | 'vivid'
  className?: string
}

/* パレット別カラー定義 */
const PALETTE_COLORS: Record<Palette, { a: string; b: string; c: string }> = {
  violet: {
    a: 'rgba(139,92,246,0.55)',
    b: 'rgba(99,102,241,0.40)',
    c: 'rgba(6,182,212,0.30)',
  },
  cyan: {
    a: 'rgba(6,182,212,0.55)',
    b: 'rgba(56,189,248,0.40)',
    c: 'rgba(139,92,246,0.30)',
  },
  amber: {
    a: 'rgba(245,158,11,0.55)',
    b: 'rgba(251,191,36,0.40)',
    c: 'rgba(239,68,68,0.25)',
  },
  store: {
    a: 'rgba(6,182,212,0.50)',
    b: 'rgba(139,92,246,0.35)',
    c: 'rgba(56,189,248,0.30)',
  },
  fc: {
    a: 'rgba(217,70,239,0.55)',
    b: 'rgba(139,92,246,0.40)',
    c: 'rgba(244,63,94,0.30)',
  },
  mixed: {
    a: 'rgba(139,92,246,0.50)',
    b: 'rgba(6,182,212,0.45)',
    c: 'rgba(245,158,11,0.30)',
  },
}

const INTENSITY_OPACITY: Record<NonNullable<AnimatedBackgroundProps['intensity']>, number> = {
  subtle: 0.55,
  medium: 0.75,
  vivid: 1.0,
}

export default function AnimatedBackground({
  variant = 'orbs',
  palette = 'violet',
  intensity = 'subtle',
  className = '',
}: AnimatedBackgroundProps) {
  const reduceMotion = useReducedMotion()
  const colors = PALETTE_COLORS[palette]
  const opacityMult = INTENSITY_OPACITY[intensity]

  const showOrbs   = variant === 'orbs' || variant === 'orbs-grid'
  const showGrid   = variant === 'grid' || variant === 'orbs-grid'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* ── 背景グリッド ──────────────────────────────── */}
      {showGrid && (
        <div
          className="absolute inset-0 cyber-grid opacity-40 dark:opacity-60"
          style={{ animationPlayState: reduceMotion ? 'paused' : 'running' }}
        />
      )}

      {/* ── オーブ A (左上) ───────────────────────────── */}
      {showOrbs && (
        <motion.div
          className="absolute -left-16 -top-16 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${colors.a} 0%, transparent 70%)`,
            opacity: opacityMult,
          }}
          variants={reduceMotion ? undefined : motionPresets.orbFloat}
          animate={reduceMotion ? undefined : 'animate'}
        />
      )}

      {/* ── オーブ B (右下) ───────────────────────────── */}
      {showOrbs && (
        <motion.div
          className="absolute -bottom-20 -right-16 h-96 w-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${colors.b} 0%, transparent 70%)`,
            opacity: opacityMult * 0.85,
          }}
          variants={reduceMotion ? undefined : motionPresets.orbFloatSlow}
          animate={reduceMotion ? undefined : 'animate'}
        />
      )}

      {/* ── オーブ C (中央アクセント) ─────────────────── */}
      {showOrbs && (
        <motion.div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${colors.c} 0%, transparent 70%)`,
            opacity: opacityMult * 0.6,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 20, -14, 0],
                  y: [0, -20, 12, 0],
                  scale: [1, 1.1, 0.95, 1],
                  transition: {
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 3,
                  },
                }
          }
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   OrbDot — 単独オーブを単体配置するための軽量コンポーネント
   例: <OrbDot color="violet" size="lg" className="right-8 top-8" />
───────────────────────────────────────────────────── */

type OrbColor = 'violet' | 'cyan' | 'amber' | 'pink' | 'emerald'
type OrbSize  = 'sm' | 'md' | 'lg' | 'xl'

interface OrbDotProps {
  color?: OrbColor
  size?: OrbSize
  delay?: number
  className?: string
}

const ORB_COLOR_MAP: Record<OrbColor, string> = {
  violet:  'bg-orb-violet',
  cyan:    'bg-orb-cyan',
  amber:   'bg-orb-amber',
  pink:    'bg-orb-pink',
  emerald: 'bg-orb-cyan', // reuse closest
}

const ORB_SIZE_MAP: Record<OrbSize, string> = {
  sm:  'h-20 w-20',
  md:  'h-40 w-40',
  lg:  'h-64 w-64',
  xl:  'h-96 w-96',
}

export function OrbDot({ color = 'violet', size = 'md', delay = 0, className = '' }: OrbDotProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl bg-orb ${ORB_COLOR_MAP[color]} ${ORB_SIZE_MAP[size]} ${className}`}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -14, 6, 0],
              x: [0, 8, -5, 0],
              transition: {
                duration: 10 + delay * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              },
            }
      }
    />
  )
}
