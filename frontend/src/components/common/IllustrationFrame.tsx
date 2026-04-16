/**
 * IllustrationFrame
 *
 * イラスト配置ルールを内包したフレームコンポーネント。
 * BrandIllustration や SVG コンテンツをラップして使う。
 *
 * placement:
 *   - "hero"    — ヒーロー右側 / 大きめ、フローティング
 *   - "section" — セクション内 / 中程度、インセット
 *   - "card"    — カード内 / 小さめ、角丸
 *   - "inline"  — テキスト横 / コンパクト、シンプル
 *   - "full"    — 全幅背景用 / ポジション absolute
 *
 * size: "sm" | "md" | "lg" | "auto"
 *
 * interactive: hover で浮き上がり
 */

import { motion, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

type Placement = 'hero' | 'section' | 'card' | 'inline' | 'full'
type IllusSize  = 'sm' | 'md' | 'lg' | 'auto'
type Site       = 'main' | 'store' | 'fc'

interface IllustrationFrameProps extends PropsWithChildren {
  placement?: Placement
  size?: IllusSize
  site?: Site
  interactive?: boolean
  float?: boolean
  className?: string
  aspectRatio?: string
}

/* ── Placement styles ──────────────────────────── */
const PLACEMENT_CLASSES: Record<Placement, string> = {
  hero:    'relative overflow-hidden rounded-3xl border',
  section: 'relative overflow-hidden rounded-2xl border',
  card:    'relative overflow-hidden rounded-xl border',
  inline:  'relative overflow-hidden rounded-lg border',
  full:    'absolute inset-0 overflow-hidden',
}

/* ── Size classes ──────────────────────────────── */
const SIZE_CLASSES: Record<IllusSize, string> = {
  sm:   'max-w-[12rem]',
  md:   'max-w-[20rem]',
  lg:   'max-w-[28rem]',
  auto: 'w-full',
}

/* ── Site-specific border + bg tints ──────────── */
const SITE_CLASSES: Record<Site, { light: string; dark: string }> = {
  main: {
    light: 'border-violet-200/60 bg-gradient-to-br from-violet-50/70 via-white/50 to-white/30',
    dark:  'dark:border-violet-800/20 dark:from-violet-950/30 dark:via-gray-900/50 dark:to-gray-900/30',
  },
  store: {
    light: 'border-cyan-200/60 bg-gradient-to-br from-cyan-50/70 via-white/50 to-white/30',
    dark:  'dark:border-cyan-800/20 dark:from-cyan-950/30 dark:via-gray-900/50 dark:to-gray-900/30',
  },
  fc: {
    light: 'border-fuchsia-200/60 bg-gradient-to-br from-fuchsia-50/70 via-white/50 to-white/30',
    dark:  'dark:border-fuchsia-800/20 dark:from-fuchsia-950/30 dark:via-gray-900/50 dark:to-gray-900/30',
  },
}

export default function IllustrationFrame({
  placement = 'section',
  size = 'auto',
  site = 'main',
  interactive = false,
  float = false,
  className = '',
  aspectRatio = '5/4',
  children,
}: IllustrationFrameProps) {
  const reduceMotion = useReducedMotion()
  const siteStyle = SITE_CLASSES[site]

  const containerClass = [
    PLACEMENT_CLASSES[placement],
    SIZE_CLASSES[size],
    siteStyle.light,
    siteStyle.dark,
    className,
  ].join(' ')

  const floatVariant = float && !reduceMotion
    ? {
        animate: {
          y: [0, -8, 0],
          transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
        },
      }
    : undefined

  const hoverProps = interactive && !reduceMotion
    ? {
        whileHover: { scale: 1.02, y: -4 },
        transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] },
      }
    : {}

  return (
    <motion.div
      className={containerClass}
      style={{ aspectRatio }}
      variants={floatVariant}
      animate={float && !reduceMotion ? 'animate' : undefined}
      {...hoverProps}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────
   IllustrationLabel — イラスト下部に添えるキャプション
   例: <IllustrationLabel>mizzz visual motif</IllustrationLabel>
───────────────────────────────────────────────────── */

interface IllustrationLabelProps extends PropsWithChildren {
  className?: string
}

export function IllustrationLabel({ children, className = '' }: IllustrationLabelProps) {
  return (
    <div
      className={`absolute inset-x-4 bottom-4 rounded-xl border border-white/50 bg-white/65 p-2.5 backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/65 ${className}`}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
        {children}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   IllustrationDot — 装飾的な色付きドット
   SVG 図の背景アクセントに配置する
───────────────────────────────────────────────────── */

interface IllustrationDotProps {
  color?: string
  size?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  delay?: number
}

export function IllustrationDot({
  color = 'bg-violet-400/30',
  size = 'h-20 w-20',
  top,
  left,
  right,
  bottom,
  delay = 0,
}: IllustrationDotProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-2xl ${color} ${size}`}
      style={{ top, left, right, bottom }}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -10, 4, 0],
              x: [0, 6, -4, 0],
              transition: {
                duration: 7 + delay * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              },
            }
      }
    />
  )
}
