import { cn } from '@/lib/design-system/classNames'

export type SemanticBadgeTone =
  | 'new'
  | 'limited'
  | 'members'
  | 'featured'
  | 'trending'
  | 'early_access'
  | 'neutral'

interface Props {
  tone: SemanticBadgeTone
  children: string
  className?: string
}

const toneClassMap: Record<SemanticBadgeTone, string> = {
  new: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300',
  limited: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300',
  members: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-300',
  featured: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300',
  trending: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/70 dark:bg-fuchsia-950/40 dark:text-fuchsia-300',
  early_access: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-300',
  neutral: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300',
}

export default function SemanticBadge({ tone, children, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]',
      toneClassMap[tone],
      className,
    )}
    >
      {children}
    </span>
  )
}
