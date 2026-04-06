import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { submitRestockRequest } from '../lib/restock'

interface Props {
  productId: number
  productSlug: string
  productTitle: string
}

export default function RestockNotifyForm({ productId, productSlug, productTitle }: Props) {
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setDone(false)

    try {
      setSending(true)
      await submitRestockRequest({
        email,
        productId,
        productSlug,
        productTitle,
        locale: i18n.language,
      })
      setDone(true)
      setEmail('')
    } catch {
      setError(t('store.restockError', { defaultValue: '通知登録に失敗しました。時間をおいて再試行してください。' }))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded border border-gray-200 dark:border-gray-800 p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-600">
        {t('store.restockTitle', { defaultValue: '再入荷通知' })}
      </p>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
        {t('store.restockDescription', { defaultValue: 'メールアドレスを登録すると、再入荷時に通知します。' })}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('store.restockPlaceholder', { defaultValue: 'you@example.com' })}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-gray-900"
        >
          {sending
            ? t('store.restockSubmitting', { defaultValue: '送信中...' })
            : t('store.restockSubmit', { defaultValue: '通知を受け取る' })}
        </button>
      </div>
      {done && (
        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          {t('store.restockDone', { defaultValue: '通知登録を受け付けました。' })}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </form>
  )
}
