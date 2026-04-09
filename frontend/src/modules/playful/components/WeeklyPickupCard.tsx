/**
 * WeeklyPickupCard
 * 今週の発見・おすすめを表示するカード。
 * - 週単位で安定した表示（週が変わると内容が変わる）
 * - store / fc 両方で使える
 * - SurpriseCard の上位版（常時展開表示）
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useWeeklyVariant } from '../hooks/useDailyVariant'
import { trackPlayfulInteraction } from '../tracking'
import type { WeeklyPickup } from '../types'

interface Props {
  pool?: WeeklyPickup[]
  location?: string
  className?: string
}

const DEFAULT_WEEKLY_POOL: WeeklyPickup[] = [
  {
    id: 'w1',
    label: '今週の発見',
    description: '静かに探すと、いつもと違う一面が見えてくる。今週のエディターズピックをどうぞ。',
  },
  {
    id: 'w2',
    label: '週替わりのおすすめ',
    description: '毎週少し視点を変えて、お気に入りを見つけてもらえるよう選んでいます。',
  },
  {
    id: 'w3',
    label: '今週のひとこと',
    description: '好きなものに囲まれた空間が、最高の日常をつくる。',
  },
  {
    id: 'w4',
    label: 'This week',
    description: '今週は新しい何かに出会えると思う。ゆっくり見てください。',
  },
]

export default function WeeklyPickupCard({ pool, location = 'weekly_pickup', className = '' }: Props) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const item = useWeeklyVariant(pool ?? DEFAULT_WEEKLY_POOL)

  if (!item) return null

  const now = new Date()
  const weekLabel = `Week ${Math.ceil(now.getDate() / 7)} · ${now.toLocaleDateString('ja-JP', { month: 'short' })}`

  const content = (
    <div
      className={`rounded-2xl border border-gray-200/70 bg-white/80 px-5 py-4 dark:border-gray-800/70 dark:bg-gray-900/60 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
          {item.label}
        </p>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[9px] text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
          {weekLabel}
        </span>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {item.description}
      </p>
      {item.href && (
        <a
          href={item.href}
          onClick={() => trackPlayfulInteraction('weekly_pickup_click', location, { pickup_id: item.id })}
          className="mt-3 inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {t('common.viewDetails', { defaultValue: '詳細を見る' })}
          <span aria-hidden>→</span>
        </a>
      )}
    </div>
  )

  if (reduceMotion) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )
}
