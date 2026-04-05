import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/routeConstants'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface MemberGuideCardProps {
  className?: string
}

export default function MemberGuideCard({ className = '' }: MemberGuideCardProps) {
  const { t } = useTranslation()
  const { isLoaded, isSignedIn, user } = useCurrentUser()

  const isMember = user?.role === 'member' || user?.role === 'admin'
  const title = !isLoaded
    ? t('memberGuide.loadingTitle', { defaultValue: '会員状態を確認中です…' })
    : isMember
      ? t('memberGuide.memberTitle', { defaultValue: '会員状態は有効です' })
      : isSignedIn
        ? t('memberGuide.signedInTitle', { defaultValue: '会員登録で限定導線を解放できます' })
        : t('memberGuide.guestTitle', { defaultValue: 'ログインして会員状態を確認しましょう' })

  const body = !isLoaded
    ? t('memberGuide.loadingBody', { defaultValue: 'マイページと会員特典の同期を行っています。' })
    : isMember
      ? t('memberGuide.memberBody', { defaultValue: 'FC限定コンテンツ・商品への導線をそのまま利用できます。' })
      : isSignedIn
        ? t('memberGuide.signedInBody', { defaultValue: '現在は一般ユーザーです。マイページから会員導線をご確認ください。' })
        : t('memberGuide.guestBody', { defaultValue: 'まずはログインして、マイページで会員状態を確認してください。' })

  return (
    <aside className={`mt-6 rounded-md border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/60 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {t('memberGuide.label', { defaultValue: 'Member Guide' })}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{body}</p>
      <Link to={ROUTES.MEMBER} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
        {t('memberGuide.cta', { defaultValue: 'マイページへ' })} →
      </Link>
    </aside>
  )
}
