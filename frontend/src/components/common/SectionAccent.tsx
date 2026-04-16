/**
 * SectionAccent
 *
 * セクション背景のアクセント装飾コンポーネント。
 * pointer-events: none で UI を妨げず、
 * position: absolute で親コンテナに重ね配置。
 *
 * 使い方:
 *   <section className="relative overflow-hidden">
 *     <SectionAccent variant="top-radial" palette="violet" />
 *     {content}
 *   </section>
 *
 * variant:
 *   - "top-radial"     — 上部から放射状グロー
 *   - "bottom-radial"  — 下部から放射状グロー
 *   - "side-line"      — 左側縦ライン + グロー
 *   - "corner-orb"     — 四隅オーブ
 *   - "cross-radial"   — 四方向から複合グロー
 *   - "noise"          — ノイズテクスチャオーバーレイ
 */

import { motion, useReducedMotion } from 'framer-motion'

type AccentVariant =
  | 'top-radial'
  | 'bottom-radial'
  | 'side-line'
  | 'corner-orb'
  | 'cross-radial'
  | 'noise'

type AccentPalette = 'violet' | 'cyan' | 'amber' | 'pink' | 'mixed'

interface SectionAccentProps {
  variant?: AccentVariant
  palette?: AccentPalette
  /** opacity multiplier 0–1 */
  opacity?: number
  className?: string
}

/* ── パレットの色定義 ──────────────────────────── */
const PALETTE: Record<AccentPalette, {
  light: { primary: string; secondary: string }
  dark:  { primary: string; secondary: string }
}> = {
  violet: {
    light: { primary: 'rgba(124,58,237,0.07)', secondary: 'rgba(99,102,241,0.05)' },
    dark:  { primary: 'rgba(139,92,246,0.12)', secondary: 'rgba(99,102,241,0.08)' },
  },
  cyan: {
    light: { primary: 'rgba(8,145,178,0.07)', secondary: 'rgba(6,182,212,0.05)' },
    dark:  { primary: 'rgba(6,182,212,0.12)', secondary: 'rgba(56,189,248,0.08)' },
  },
  amber: {
    light: { primary: 'rgba(217,119,6,0.07)', secondary: 'rgba(245,158,11,0.05)' },
    dark:  { primary: 'rgba(245,158,11,0.12)', secondary: 'rgba(251,191,36,0.08)' },
  },
  pink: {
    light: { primary: 'rgba(192,38,211,0.07)', secondary: 'rgba(236,72,153,0.05)' },
    dark:  { primary: 'rgba(217,70,239,0.12)', secondary: 'rgba(244,63,94,0.08)' },
  },
  mixed: {
    light: { primary: 'rgba(124,58,237,0.06)', secondary: 'rgba(8,145,178,0.05)' },
    dark:  { primary: 'rgba(139,92,246,0.10)', secondary: 'rgba(6,182,212,0.08)' },
  },
}

export default function SectionAccent({
  variant = 'top-radial',
  palette = 'violet',
  opacity = 1,
  className = '',
}: SectionAccentProps) {
  const reduceMotion = useReducedMotion()

  /* ── top-radial ─────────────────────────────────── */
  if (variant === 'top-radial') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-64 ${className}`}
        style={{ opacity }}
      >
        {/* ライトモード用グロー */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%)',
          }}
        />
        {/* ダークモード用グロー（明度を上げる） */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />
      </div>
    )
  }

  /* ── bottom-radial ───────────────────────────────── */
  if (variant === 'bottom-radial') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-64 ${className}`}
        style={{ opacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 100%,
              rgba(124,58,237,0.06) 0%, transparent 70%)`,
          }}
        />
        <div
          className="dark:block hidden absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 100%,
              rgba(139,92,246,0.11) 0%, transparent 70%)`,
          }}
        />
      </div>
    )
  }

  /* ── side-line ──────────────────────────────────── */
  if (variant === 'side-line') {
    const pal = PALETTE[palette]
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-px ${className}`}
        style={{ opacity }}
      >
        {/* 縦グラジエントライン */}
        <div
          className="h-full w-px"
          style={{
            background: `linear-gradient(to bottom,
              transparent 0%,
              ${pal.light.primary} 30%,
              ${pal.light.primary} 70%,
              transparent 100%)`,
          }}
        />
        {/* ライン横のグロー */}
        <div
          className="absolute inset-y-0 -left-1 w-8"
          style={{
            background: `linear-gradient(to right, ${pal.light.secondary}, transparent)`,
          }}
        />
        <div
          className="dark:flex hidden absolute inset-y-0 -left-1 w-12"
          style={{
            background: `linear-gradient(to right, ${pal.dark.secondary}, transparent)`,
          }}
        />
      </div>
    )
  }

  /* ── corner-orb ─────────────────────────────────── */
  if (variant === 'corner-orb') {
    const pal = PALETTE[palette]
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{ opacity }}
      >
        {/* 左上 */}
        <motion.div
          className="absolute -left-12 -top-12 h-48 w-48 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${pal.light.primary} 0%, transparent 70%)` }}
          animate={reduceMotion ? undefined : {
            y: [0, -8, 0],
            transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        {/* 右下 */}
        <motion.div
          className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${pal.light.secondary} 0%, transparent 70%)` }}
          animate={reduceMotion ? undefined : {
            y: [0, 10, 0],
            transition: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 },
          }}
        />
        {/* dark overrides */}
        <motion.div
          className="dark:block hidden absolute -left-12 -top-12 h-48 w-48 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${pal.dark.primary} 0%, transparent 70%)` }}
          animate={reduceMotion ? undefined : {
            y: [0, -8, 0],
            transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        <motion.div
          className="dark:block hidden absolute -bottom-12 -right-12 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${pal.dark.secondary} 0%, transparent 70%)` }}
          animate={reduceMotion ? undefined : {
            y: [0, 10, 0],
            transition: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 },
          }}
        />
      </div>
    )
  }

  /* ── cross-radial ───────────────────────────────── */
  if (variant === 'cross-radial') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{ opacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 55% 40% at 20%  0%,   rgba(124,58,237,0.06)  0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 80%  100%, rgba(8,145,178,0.05)   0%, transparent 60%),
              radial-gradient(ellipse 40% 50% at 50%  50%,  rgba(217,119,6,0.025)  0%, transparent 60%)
            `,
          }}
        />
        <div
          className="dark:block hidden absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 55% 40% at 20%  0%,   rgba(139,92,246,0.10) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 80%  100%, rgba(6,182,212,0.09)  0%, transparent 60%),
              radial-gradient(ellipse 40% 50% at 50%  50%,  rgba(245,158,11,0.04) 0%, transparent 60%)
            `,
          }}
        />
      </div>
    )
  }

  /* ── noise ───────────────────────────────────────── */
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 noise-overlay ${className}`}
      style={{ opacity: opacity * 0.5 }}
    />
  )
}
