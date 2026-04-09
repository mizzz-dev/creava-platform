/**
 * MemberPlayfulBlock
 * 会員限定のちょっとした遊び要素コンテナ。
 * - 未ログインには何も表示しない（コンテンツ保護）
 * - ログイン済みには特別な演出を表示
 * - 訪問回数に応じて greeting が変わる
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/hooks'
import { useVisitCount, getVisitGreetingIndex } from '../hooks/useVisitCount'
import { trackPlayfulInteraction } from '../tracking'
import type { PlayfulSite } from '../types'

interface Props {
  site: PlayfulSite
  children?: React.ReactNode
  className?: string
}

/** 訪問回数別のグリーティング（日本語のみ。i18n キーで上書き可能） */
const GREETINGS = [
  'いらっしゃいませ。はじめての方ですか？',
  'またお越しいただけて嬉しいです。',
  'いつもありがとうございます。',
  'すっかりおなじみですね。',
  'あなたの存在が、ここを特別にしています。',
]

export default function MemberPlayfulBlock({ site, children, className = '' }: Props) {
  const { t } = useTranslation()
  const { user } = useCurrentUser()
  const reduceMotion = useReducedMotion()
  const visitCount = useVisitCount(site)
  const greetingIdx = getVisitGreetingIndex(visitCount)

  // 未ログインは何も表示しない
  if (!user) return null

  const greeting = t(`playful.visitGreeting.${greetingIdx}`, {
    defaultValue: GREETINGS[greetingIdx],
  })

  const inner = (
    <div
      className={`rounded-2xl border border-violet-200/60 bg-violet-50/40 px-5 py-4 dark:border-violet-900/40 dark:bg-violet-950/15 ${className}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-500 dark:text-violet-400">
        {t('playful.memberBlockLabel', { defaultValue: 'members only' })}
      </p>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{greeting}</p>
      {visitCount > 1 && (
        <p className="mt-1 font-mono text-[10px] text-gray-400 dark:text-gray-500">
          {t('playful.visitCount', { count: visitCount, defaultValue: `${visitCount}回目のご訪問` })}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )

  if (reduceMotion) return inner

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={() =>
        trackPlayfulInteraction('member_playful_view', `${site}_member_block`, {
          visit_count: visitCount,
        })
      }
    >
      {inner}
    </motion.div>
  )
}
