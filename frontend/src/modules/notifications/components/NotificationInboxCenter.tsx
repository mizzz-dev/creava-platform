import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/routeConstants'
import { SITE_TYPE } from '@/lib/siteLinks'
import { trackMizzzEvent } from '@/modules/analytics/tracking'
import { archiveMessage, dismissMessage, getNotificationInbox, markMessageRead } from '@/modules/notifications/inboxApi'
import type { InboxMessage, NotificationInboxResponse } from '@/modules/notifications/inboxTypes'

const FALLBACK: NotificationInboxResponse = {
  inboxSummary: { total: 0, unread: 0, read: 0, archived: 0, dismissed: 0, important: 0, actionRequired: 0, byCategory: {} },
  deliverySummary: { total: 0, delivered: 0, pending: 0, failed: 0, skipped: 0, suppressed: 0 },
  unreadSummary: { total: 0, important: 0, actionRequired: 0 },
  preferenceState: { inAppOptIn: true, emailOptIn: true, notificationConsentState: 'enabled', crmConsentState: 'opted_in' },
  messages: [],
}

export default function NotificationInboxCenter({ authToken }: { authToken: string | null }) {
  const { t } = useTranslation()
  const [state, setState] = useState<NotificationInboxResponse>(FALLBACK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('all')

  useEffect(() => {
    if (!authToken) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getNotificationInbox(authToken)
      .then((next) => {
        if (!cancelled) setState(next)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.notificationInboxLoadError', { defaultValue: '通知センターの読み込みに失敗しました。' }))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    trackMizzzEvent('notification_center_view', { sourceSite: SITE_TYPE })
    trackMizzzEvent('inbox_summary_view', { sourceSite: SITE_TYPE })

    return () => {
      cancelled = true
    }
  }, [authToken, t])

  const categories = useMemo(() => ['all', ...Object.keys(state.inboxSummary.byCategory)], [state.inboxSummary.byCategory])
  const filtered = useMemo(() => {
    if (category === 'all') return state.messages
    return state.messages.filter((item) => item.messageCategory === category)
  }, [category, state.messages])

  const onRead = async (item: InboxMessage) => {
    if (!authToken || item.readState === 'read') return
    await markMessageRead(authToken, item.messageId)
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) => (message.messageId === item.messageId ? { ...message, readState: 'read', readAt: new Date().toISOString() } : message)),
    }))
    trackMizzzEvent('message_mark_read', { sourceSite: SITE_TYPE, messageType: item.messageType, messageCategory: item.messageCategory })
  }

  const onArchive = async (item: InboxMessage) => {
    if (!authToken || item.archiveState === 'archived') return
    await archiveMessage(authToken, item.messageId)
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) => (message.messageId === item.messageId ? { ...message, archiveState: 'archived', archivedAt: new Date().toISOString() } : message)),
    }))
    trackMizzzEvent('message_archive', { sourceSite: SITE_TYPE, messageType: item.messageType, messageCategory: item.messageCategory })
  }

  const onDismiss = async (item: InboxMessage) => {
    if (!authToken || item.dismissState === 'dismissed') return
    await dismissMessage(authToken, item.messageId)
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) => (message.messageId === item.messageId ? { ...message, dismissState: 'dismissed', dismissedAt: new Date().toISOString() } : message)),
    }))
    trackMizzzEvent('message_dismiss', { sourceSite: SITE_TYPE, messageType: item.messageType, messageCategory: item.messageCategory })
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('common.notificationCenter', { defaultValue: '通知センター' })}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('common.notificationCrossSiteDescription', { defaultValue: 'main / store / fc をまたいだ通知を1つの inbox で確認できます。' })}
          </p>
        </div>
        <Link to={ROUTES.MEMBER} className="text-xs underline text-violet-700 dark:text-violet-300">{t('common.backToMember', { defaultValue: 'マイページへ戻る' })}</Link>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700">unread: <span className="font-semibold">{state.unreadSummary.total}</span></div>
        <div className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700">important: <span className="font-semibold">{state.unreadSummary.important}</span></div>
        <div className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700">action required: <span className="font-semibold">{state.unreadSummary.actionRequired}</span></div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full border px-3 py-1 text-xs ${category === item ? 'border-violet-500 text-violet-700 dark:text-violet-300' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{t('common.loading')}</p>}
      {error && <p className="mt-4 text-xs text-rose-600">{error}</p>}

      <div className="mt-4 space-y-2">
        {filtered.map((item) => (
          <article key={item.messageId} className="rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
              <div className="flex items-center gap-2">
                {item.messagePriority === 'high' && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">重要</span>}
                <span className="text-[10px] text-gray-500">{item.sourceSite}</span>
              </div>
            </div>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{item.body}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button type="button" onClick={() => { void onRead(item) }} className="underline text-violet-700 dark:text-violet-300">既読にする</button>
              <button type="button" onClick={() => { void onArchive(item) }} className="underline text-gray-600 dark:text-gray-300">archive</button>
              <button type="button" onClick={() => { void onDismiss(item) }} className="underline text-gray-600 dark:text-gray-300">dismiss</button>
              {item.href && <Link to={item.href} className="underline text-cyan-700 dark:text-cyan-300">詳細</Link>}
            </div>
          </article>
        ))}
        {!loading && filtered.length === 0 && <p className="rounded border border-dashed border-gray-300 p-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">{t('common.notificationEmpty', { defaultValue: '通知はありません。' })}</p>}
      </div>
    </section>
  )
}
