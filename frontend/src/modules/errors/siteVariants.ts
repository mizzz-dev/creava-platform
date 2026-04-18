import { isFanclubSite, isStoreSite } from '@/lib/siteLinks'
import type { ErrorPageVariant } from '@/modules/errors/useErrorPageContent'

export type SiteKind = 'main' | 'store' | 'fanclub'

export function getSiteKind(): SiteKind {
  if (isStoreSite) return 'store'
  if (isFanclubSite) return 'fanclub'
  return 'main'
}

/**
 * 各サイト × 各エラーコードの色味・モチーフ差分を集約する。
 *
 * - main    : 上品な violet / aurora 系。エディトリアル寄り。
 * - store   : 暖かい amber / coral 系。プロダクトの温度感に寄せる。
 * - fanclub : 深い indigo / cyan 系。親密で艶のある世界観。
 *
 * code 別:
 *  - 404 : サイトのアクセントカラー（少し遊び心）
 *  - 500 : 控えめな warning（red 系を抑えめに）
 *  - 503 : メンテ感（amber を基調）
 *  - 403 : 鍵モチーフ（violet / cyan 系）
 */
export interface ErrorSiteVariant {
  /** ambient orb / glow rgba color */
  glow: string
  /** code 影用の rgba */
  codeGhost: string
  /** floating shape ボーダー Tailwind class */
  shapeBorder: string
  /** floating spark Tailwind bg class */
  sparkBg: string
  /** eyebrow テキスト Tailwind class */
  eyebrow: string
  /** 角ブラケット Tailwind class */
  bracket: string
  /** primary CTA accent (gradient hover) */
  accentFrom: string
  accentTo: string
  /** small badge / chip 色 */
  chipBg: string
  chipText: string
  /** illustration accent (svg color via Tailwind) */
  illustration: string
  illustrationSoft: string
}

const PALETTE = {
  violet: {
    glow: 'rgba(124,58,237,0.05)',
    codeGhost: 'rgba(124,58,237,0.06)',
    shapeBorder: 'border-violet-200/40 dark:border-violet-500/10',
    sparkBg: 'bg-violet-400/50 dark:bg-violet-400/35',
    eyebrow: 'text-violet-500/60 dark:text-violet-300/55',
    bracket: 'border-violet-200/40 dark:border-violet-500/10',
    accentFrom: 'from-violet-500/15',
    accentTo: 'to-fuchsia-500/0',
    chipBg: 'bg-violet-50/70 dark:bg-violet-500/5 border-violet-200/60 dark:border-violet-500/15',
    chipText: 'text-violet-600 dark:text-violet-300/85',
    illustration: 'text-violet-400/70 dark:text-violet-400/55',
    illustrationSoft: 'text-violet-200/60 dark:text-violet-500/15',
  },
  amber: {
    glow: 'rgba(245,158,11,0.06)',
    codeGhost: 'rgba(245,158,11,0.07)',
    shapeBorder: 'border-amber-200/45 dark:border-amber-500/12',
    sparkBg: 'bg-amber-400/55 dark:bg-amber-400/40',
    eyebrow: 'text-amber-600/70 dark:text-amber-300/65',
    bracket: 'border-amber-200/45 dark:border-amber-500/12',
    accentFrom: 'from-amber-500/18',
    accentTo: 'to-rose-500/0',
    chipBg: 'bg-amber-50/70 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/15',
    chipText: 'text-amber-700 dark:text-amber-300/85',
    illustration: 'text-amber-500/75 dark:text-amber-300/60',
    illustrationSoft: 'text-amber-200/60 dark:text-amber-500/15',
  },
  cyan: {
    glow: 'rgba(34,211,238,0.05)',
    codeGhost: 'rgba(56,189,248,0.07)',
    shapeBorder: 'border-cyan-200/35 dark:border-cyan-500/10',
    sparkBg: 'bg-cyan-300/55 dark:bg-cyan-300/35',
    eyebrow: 'text-cyan-600/70 dark:text-cyan-300/60',
    bracket: 'border-cyan-200/40 dark:border-cyan-500/10',
    accentFrom: 'from-cyan-500/15',
    accentTo: 'to-violet-500/0',
    chipBg: 'bg-cyan-50/70 dark:bg-cyan-500/5 border-cyan-200/60 dark:border-cyan-500/15',
    chipText: 'text-cyan-700 dark:text-cyan-300/85',
    illustration: 'text-cyan-400/75 dark:text-cyan-300/55',
    illustrationSoft: 'text-cyan-200/55 dark:text-cyan-500/12',
  },
  red: {
    glow: 'rgba(239,68,68,0.05)',
    codeGhost: 'rgba(239,68,68,0.06)',
    shapeBorder: 'border-red-200/35 dark:border-red-500/10',
    sparkBg: 'bg-red-400/45 dark:bg-red-400/30',
    eyebrow: 'text-red-500/60 dark:text-red-300/55',
    bracket: 'border-red-200/35 dark:border-red-500/10',
    accentFrom: 'from-red-500/15',
    accentTo: 'to-amber-500/0',
    chipBg: 'bg-red-50/70 dark:bg-red-500/5 border-red-200/60 dark:border-red-500/15',
    chipText: 'text-red-600 dark:text-red-300/85',
    illustration: 'text-red-400/70 dark:text-red-400/50',
    illustrationSoft: 'text-red-200/55 dark:text-red-500/15',
  },
} as const satisfies Record<string, ErrorSiteVariant>

/**
 * サイト × エラーコードに応じた色設定を返す。
 * 「main / store / fc で世界観差を保ちつつ、code ごとの意味も伝える」がポリシー。
 */
export function getErrorVariant(code: ErrorPageVariant, site: SiteKind = getSiteKind()): ErrorSiteVariant {
  // 503 はサイト関係なくメンテ色（amber）に寄せる
  if (code === '503') return PALETTE.amber
  // 403 は鍵モチーフ → violet 寄せ（fc は cyan で艶）
  if (code === '403') return site === 'fanclub' ? PALETTE.cyan : PALETTE.violet
  // 500 は控えめ red、ただし fc / store ではサイトカラー寄せで安心感
  if (code === '500') {
    if (site === 'store') return PALETTE.amber
    if (site === 'fanclub') return PALETTE.cyan
    return PALETTE.red
  }
  // 404 はサイトカラーを素直に出す（一番遊んでよい）
  if (site === 'store') return PALETTE.amber
  if (site === 'fanclub') return PALETTE.cyan
  return PALETTE.violet
}
