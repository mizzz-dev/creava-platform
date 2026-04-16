/**
 * BrandIllustration
 *
 * mizzz ブランドの共通ビジュアルモチーフ。
 * SVG パス + 浮遊オーブ + グラスモーフィズムカードの組み合わせで
 * ライト / ダーク 両テーマで高品質に見える。
 *
 * バリアント:
 *   store   — ストア (violet)
 *   fanclub — ファンクラブ (fuchsia)
 *   limited — 限定品 (amber)
 *   support — サポート (emerald)
 *   main    — メインサイト (indigo x cyan)
 *   empty   — 空状態 (gray)
 *   error   — エラー状態 (red)
 */

import { motion, useReducedMotion } from 'framer-motion'
import { motionPresets } from '@/components/common/motionPresets'

type IllusVariant = 'store' | 'fanclub' | 'limited' | 'support' | 'main' | 'empty' | 'error'

interface BrandIllustrationProps {
  variant?: IllusVariant
  className?: string
  /** hover で浮き上がる interactive モード */
  interactive?: boolean
  /** キャプションテキスト (省略可) */
  caption?: string
}

/* ── カラーパレット per variant ──────────────────── */
const VARIANT_TONE = {
  store: {
    primary:    'fill-violet-500/30 dark:fill-violet-400/25',
    secondary:  'fill-indigo-400/25 dark:fill-indigo-300/20',
    stroke:     'stroke-violet-600/70 dark:stroke-violet-300/70',
    orbA:       'fill-violet-400/30 dark:fill-violet-400/20',
    orbB:       'fill-indigo-400/25 dark:fill-indigo-300/15',
    bg:         'from-violet-50/70 dark:from-violet-950/30',
    border:     'border-violet-200/50 dark:border-violet-800/20',
    label:      '// store',
    caption:    'あなたのスタイルを見つける場所。',
  },
  fanclub: {
    primary:    'fill-fuchsia-500/30 dark:fill-fuchsia-400/25',
    secondary:  'fill-sky-400/25 dark:fill-sky-300/20',
    stroke:     'stroke-fuchsia-600/70 dark:stroke-fuchsia-300/70',
    orbA:       'fill-fuchsia-400/30 dark:fill-fuchsia-400/20',
    orbB:       'fill-sky-400/25 dark:fill-sky-300/15',
    bg:         'from-fuchsia-50/70 dark:from-fuchsia-950/30',
    border:     'border-fuchsia-200/50 dark:border-fuchsia-800/20',
    label:      '// fanclub',
    caption:    'ファンと、もっと深く繋がる場所。',
  },
  limited: {
    primary:    'fill-amber-500/30 dark:fill-amber-400/30',
    secondary:  'fill-rose-400/25 dark:fill-rose-300/20',
    stroke:     'stroke-amber-600/70 dark:stroke-amber-300/70',
    orbA:       'fill-amber-400/30 dark:fill-amber-400/20',
    orbB:       'fill-rose-400/25 dark:fill-rose-300/15',
    bg:         'from-amber-50/70 dark:from-amber-950/30',
    border:     'border-amber-200/50 dark:border-amber-800/20',
    label:      '// limited',
    caption:    '数量限定、今だけの特別な一点。',
  },
  support: {
    primary:    'fill-emerald-500/30 dark:fill-emerald-400/25',
    secondary:  'fill-cyan-400/25 dark:fill-cyan-300/20',
    stroke:     'stroke-emerald-600/70 dark:stroke-emerald-300/70',
    orbA:       'fill-emerald-400/30 dark:fill-emerald-400/20',
    orbB:       'fill-cyan-400/25 dark:fill-cyan-300/15',
    bg:         'from-emerald-50/70 dark:from-emerald-950/30',
    border:     'border-emerald-200/50 dark:border-emerald-800/20',
    label:      '// support',
    caption:    'あなたのそばにいつでも。',
  },
  main: {
    primary:    'fill-indigo-500/30 dark:fill-indigo-400/25',
    secondary:  'fill-cyan-400/25 dark:fill-cyan-300/20',
    stroke:     'stroke-indigo-600/60 dark:stroke-cyan-400/60',
    orbA:       'fill-indigo-400/30 dark:fill-violet-400/20',
    orbB:       'fill-cyan-400/25 dark:fill-cyan-300/15',
    bg:         'from-indigo-50/70 dark:from-indigo-950/30',
    border:     'border-indigo-200/50 dark:border-indigo-800/20',
    label:      '// mizzz',
    caption:    '静けさと躍動の中間を表現する、共通ビジュアルエレメント。',
  },
  empty: {
    primary:    'fill-gray-300/50 dark:fill-gray-600/30',
    secondary:  'fill-gray-200/40 dark:fill-gray-700/25',
    stroke:     'stroke-gray-400/50 dark:stroke-gray-500/50',
    orbA:       'fill-gray-300/30 dark:fill-gray-600/15',
    orbB:       'fill-gray-200/25 dark:fill-gray-700/12',
    bg:         'from-gray-50/70 dark:from-gray-900/30',
    border:     'border-gray-200/50 dark:border-gray-700/20',
    label:      '// empty',
    caption:    'まだコンテンツがありません。',
  },
  error: {
    primary:    'fill-red-300/30 dark:fill-red-400/20',
    secondary:  'fill-orange-300/25 dark:fill-orange-400/15',
    stroke:     'stroke-red-400/60 dark:stroke-red-400/60',
    orbA:       'fill-red-300/25 dark:fill-red-500/15',
    orbB:       'fill-orange-300/20 dark:fill-orange-400/12',
    bg:         'from-red-50/60 dark:from-red-950/20',
    border:     'border-red-200/50 dark:border-red-800/20',
    label:      '// error',
    caption:    '問題が発生しました。',
  },
} as const

/* ── SVG パス per variant ────────────────────────── */
type SvgConfig = {
  paths: Array<{ d: string; strokeWidth: string; opacity?: string }>
  circles: Array<{ cx: number; cy: number; r: number; className: string }>
}

const VARIANT_SVG: Record<IllusVariant, SvgConfig> = {
  store: {
    paths: [
      { d: 'M30 148c24-43 66-73 118-81 38-5 78 6 121 33', strokeWidth: '1.5' },
      { d: 'M55 169c40-18 72-25 120-18 35 5 59 15 93 36',  strokeWidth: '1.2', opacity: '0.8' },
      { d: 'M84 56c16-21 35-29 58-24 22 5 39 22 50 42',   strokeWidth: '1.2', opacity: '0.7' },
    ],
    circles: [
      { cx: 96,  cy: 78,  r: 8,  className: 'primary' },
      { cx: 214, cy: 74,  r: 11, className: 'secondary' },
      { cx: 167, cy: 122, r: 5,  className: 'white' },
    ],
  },
  fanclub: {
    paths: [
      { d: 'M20 160c30-50 80-80 140-78 40 1 72 14 120 45', strokeWidth: '1.5' },
      { d: 'M40 178c42-14 80-20 130-12 38 6 65 18 100 40', strokeWidth: '1.2', opacity: '0.75' },
      { d: 'M70 50c20-18 44-24 65-16 28 10 42 30 50 52',   strokeWidth: '1.2', opacity: '0.65' },
    ],
    circles: [
      { cx: 100, cy: 70,  r: 9,  className: 'primary' },
      { cx: 220, cy: 80,  r: 12, className: 'secondary' },
      { cx: 155, cy: 130, r: 6,  className: 'white' },
    ],
  },
  limited: {
    paths: [
      { d: 'M28 155c20-38 55-65 100-74 36-7 76 2 130 28',  strokeWidth: '1.5' },
      { d: 'M50 172c38-16 68-24 114-18 36 5 64 14 100 34', strokeWidth: '1.2', opacity: '0.8' },
      { d: 'M90 46c14-20 32-28 56-22 24 6 40 24 48 46',    strokeWidth: '1.2', opacity: '0.68' },
    ],
    circles: [
      { cx: 92,  cy: 72,  r: 9,  className: 'primary' },
      { cx: 210, cy: 68,  r: 13, className: 'secondary' },
      { cx: 160, cy: 118, r: 5,  className: 'white' },
    ],
  },
  support: {
    paths: [
      { d: 'M24 152c26-45 70-76 124-82 40-4 78 8 122 35', strokeWidth: '1.5' },
      { d: 'M48 170c42-17 76-26 126-18 38 6 62 17 96 38', strokeWidth: '1.2', opacity: '0.78' },
      { d: 'M80 52c18-22 38-30 60-24 24 7 40 24 50 44',   strokeWidth: '1.2', opacity: '0.68' },
    ],
    circles: [
      { cx: 94,  cy: 76,  r: 8,  className: 'primary' },
      { cx: 216, cy: 72,  r: 11, className: 'secondary' },
      { cx: 165, cy: 124, r: 5,  className: 'white' },
    ],
  },
  main: {
    paths: [
      { d: 'M18 150c28-48 78-80 136-84 42-2 82 10 126 40',  strokeWidth: '1.5' },
      { d: 'M44 168c46-16 82-22 134-14 40 6 68 18 102 42',  strokeWidth: '1.2', opacity: '0.75' },
      { d: 'M76 48c20-24 46-32 68-24 26 9 44 28 52 50',     strokeWidth: '1.3', opacity: '0.62' },
    ],
    circles: [
      { cx: 98,  cy: 70,  r: 10, className: 'primary' },
      { cx: 218, cy: 76,  r: 14, className: 'secondary' },
      { cx: 158, cy: 126, r: 6,  className: 'white' },
    ],
  },
  empty: {
    paths: [
      { d: 'M60 160c30-40 70-65 110-68 30-2 58 8 90 28',   strokeWidth: '1.2' },
      { d: 'M80 175c28-12 58-18 94-14 28 3 50 12 74 28',   strokeWidth: '1.0', opacity: '0.6' },
      { d: 'M100 80c10-16 28-22 48-18 20 5 32 18 38 34',   strokeWidth: '1.0', opacity: '0.5' },
    ],
    circles: [
      { cx: 110, cy: 90,  r: 7,  className: 'primary' },
      { cx: 200, cy: 86,  r: 9,  className: 'secondary' },
      { cx: 155, cy: 135, r: 4,  className: 'white' },
    ],
  },
  error: {
    paths: [
      { d: 'M50 155c22-36 60-60 108-65 38-4 72 6 120 30',  strokeWidth: '1.2' },
      { d: 'M72 170c34-14 66-20 110-14 34 5 58 14 92 32',  strokeWidth: '1.0', opacity: '0.65' },
      { d: 'M94 60c14-18 32-26 54-20 22 6 36 20 44 40',    strokeWidth: '1.0', opacity: '0.55' },
    ],
    circles: [
      { cx: 100, cy: 82,  r: 8,  className: 'primary' },
      { cx: 205, cy: 78,  r: 10, className: 'secondary' },
      { cx: 158, cy: 128, r: 4,  className: 'white' },
    ],
  },
}

export default function BrandIllustration({
  variant = 'store',
  className,
  interactive = false,
  caption,
}: BrandIllustrationProps) {
  const tone = VARIANT_TONE[variant]
  const svgCfg = VARIANT_SVG[variant]
  const reduceMotion = useReducedMotion()

  /* ── circle fill クラスを tone から解決 ─────────── */
  function circleClass(type: string): string {
    if (type === 'primary')   return tone.primary
    if (type === 'secondary') return tone.secondary
    return 'fill-white/60 dark:fill-white/30'
  }

  /* ── interactive ホバー props ────────────────────── */
  const hoverProps = interactive && !reduceMotion
    ? {
        whileHover: { y: -6, scale: 1.02 },
        transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] },
      }
    : {}

  const displayCaption = caption ?? tone.caption

  return (
    <motion.div
      className={[
        /* interactive 時は pointer-events を有効にして whileHover / cursor を機能させる */
        interactive ? 'cursor-pointer' : 'pointer-events-none',
        'relative aspect-[5/4] w-full overflow-hidden rounded-3xl border',
        'bg-gradient-to-br via-white/30 to-white/10 backdrop-blur-sm',
        tone.bg,
        tone.border,
        className ?? '',
      ].join(' ')}
      {...hoverProps}
    >
      {/* ── 浮遊オーブ A ────────────────────────── */}
      <motion.div
        className={`absolute -left-8 top-4 h-36 w-36 rounded-full blur-2xl ${tone.orbA}`}
        variants={motionPresets.illustrationFloatSoft}
        initial="rest"
        animate={reduceMotion ? 'rest' : 'animate'}
      />

      {/* ── 浮遊オーブ B ────────────────────────── */}
      <motion.div
        className={`absolute -bottom-10 right-4 h-40 w-40 rounded-full blur-2xl ${tone.orbB}`}
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -12, 0],
                y: [0, 12, 0],
                transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
              }
        }
      />

      {/* ── SVG ビジュアルモチーフ ─────────────── */}
      <svg
        viewBox="0 0 300 220"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`mizzz ${variant} illustration`}
      >
        {svgCfg.paths.map((p, i) => (
          <motion.path
            key={i}
            d={p.d}
            className={`fill-none stroke-[${p.strokeWidth}] ${tone.stroke}`}
            opacity={p.opacity ?? 1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: Number(p.opacity ?? 1) }}
            transition={{
              pathLength: { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 },
              opacity: { duration: 0.4, delay: i * 0.15 },
            }}
          />
        ))}

        {svgCfg.circles.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            className={circleClass(c.className)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.6 + i * 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
        ))}
      </svg>

      {/* ── キャプションカード ───────────────────── */}
      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/50 bg-white/65 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/65">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
          {tone.label}
        </p>
        <p className="mt-1 text-xs text-gray-700 dark:text-gray-200">
          {displayCaption}
        </p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────
   MiniIllustration — カード / バッジ用の小型バリアント
───────────────────────────────────────────────────── */

interface MiniIllustrationProps {
  variant?: IllusVariant
  size?: number
  className?: string
}

export function MiniIllustration({ variant = 'store', size = 80, className = '' }: MiniIllustrationProps) {
  const tone = VARIANT_TONE[variant]
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border ${tone.border} bg-gradient-to-br ${tone.bg} via-white/30 to-white/10 dark:via-transparent dark:to-transparent ${className}`}
      style={{ width: size, height: size * 0.8 }}
      animate={reduceMotion ? undefined : { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div className={`absolute left-2 top-2 h-8 w-8 rounded-full blur-xl ${tone.orbA}`} />
      <div className={`absolute right-1 bottom-1 h-6 w-6 rounded-full blur-lg ${tone.orbB}`} />
    </motion.div>
  )
}
