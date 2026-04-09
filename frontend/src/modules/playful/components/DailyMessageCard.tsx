/**
 * DailyMessageCard
 * 今日の一言。日替わりで変化するブランドメッセージカード。
 * - 日付ベースで安定したメッセージを表示（同日中は変わらない）
 * - 季節テーマと連動可能
 * - 非会員にも表示できるが、会員向け variant も持つ
 */
import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useDailyVariant } from '../hooks/useDailyVariant'
import { trackPlayfulInteraction } from '../tracking'
import type { DailyMessage } from '../types'
import type { SeasonalThemeKey } from '@/modules/seasonal/types'

interface Props {
  /** ブランドで管理するメッセージプール (CMSから渡せる) */
  pool?: DailyMessage[]
  /** 現在の季節テーマ */
  seasonalTheme?: SeasonalThemeKey
  /** 表示サイト */
  location?: string
  /** 会員限定モード */
  memberOnly?: boolean
  className?: string
}

/** デフォルトのメッセージプール（日本語のみ / CMS未設定時のフォールバック） */
const DEFAULT_POOL: DailyMessage[] = [
  { id: 'd1', message: '今日も、自分のペースで。' },
  { id: 'd2', message: '静かな発見が、最高の一日をつくる。' },
  { id: 'd3', message: '好きなものをもっと好きになる日。' },
  { id: 'd4', message: 'すこし遠回りしたほうが、良いものに出会える。' },
  { id: 'd5', message: '静けさの中に、一番好きなものがある。' },
  { id: 'd6', message: 'あなたが選んだものが、世界観になる。' },
  { id: 'd7', message: '今日の一枚は、何になるだろう。' },
]

const SEASONAL_POOL: Record<string, DailyMessage[]> = {
  christmas: [
    { id: 'xmas1', message: 'この季節だけの静かな光を。', seasonal: 'christmas' },
    { id: 'xmas2', message: '贈るものを、丁寧に選ぶ日。', seasonal: 'christmas' },
    { id: 'xmas3', message: '好きな音楽を、今夜ゆっくり聴いてほしい。', seasonal: 'christmas' },
  ],
  halloween: [
    { id: 'hw1', message: '今日はちょっと違う自分で。', seasonal: 'halloween' },
    { id: 'hw2', message: '隠れているものを、見つける夜。', seasonal: 'halloween' },
  ],
  newyear: [
    { id: 'ny1', message: '今年もよろしくお願いします。', seasonal: 'newyear' },
    { id: 'ny2', message: '新しい扉は、静かに開く。', seasonal: 'newyear' },
    { id: 'ny3', message: '今年の最初の発見を、ここで。', seasonal: 'newyear' },
  ],
}

export default function DailyMessageCard({
  pool,
  seasonalTheme = 'default',
  location = 'daily_message',
  memberOnly = false,
  className = '',
}: Props) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()

  const effectivePool =
    pool ??
    (seasonalTheme !== 'default' && SEASONAL_POOL[seasonalTheme]?.length
      ? [...SEASONAL_POOL[seasonalTheme], ...DEFAULT_POOL]
      : DEFAULT_POOL)

  const daily = useDailyVariant(effectivePool)

  if (!daily) return null

  const wrapper = `
    relative overflow-hidden rounded-2xl border px-5 py-4
    ${memberOnly
      ? 'border-violet-200/70 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/20'
      : 'border-gray-200/70 bg-white/80 dark:border-gray-800/70 dark:bg-gray-900/60'
    }
    ${className}
  `

  const handleClick = () => {
    trackPlayfulInteraction('daily_message_click', location, {
      message_id: daily.id,
      seasonal: seasonalTheme,
    })
  }

  const content = (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full cursor-default text-left"
      aria-label={t('playful.dailyMessageLabel', { defaultValue: '今日のひとこと' })}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
        {memberOnly
          ? t('playful.memberDailyLabel', { defaultValue: 'today — members' })
          : t('playful.dailyLabel', { defaultValue: "today's word" })}
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-gray-700 transition-colors group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100">
        {daily.message}
      </p>
      {daily.hint && (
        <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">{daily.hint}</p>
      )}
      {/* 右下に日付を小さく */}
      <p className="mt-3 text-right font-mono text-[9px] text-gray-300 dark:text-gray-600">
        {new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
      </p>
    </button>
  )

  if (reduceMotion) {
    return <div className={wrapper}>{content}</div>
  }

  return (
    <motion.div
      className={wrapper}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={() =>
        trackPlayfulInteraction('daily_message_view', location, {
          message_id: daily.id,
        })
      }
    >
      {content}
    </motion.div>
  )
}
