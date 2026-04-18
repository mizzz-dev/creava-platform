import type { FavoriteItem, MemberNotificationItem, ViewHistoryItem } from '@/modules/personalization/types'
import type { DiscoveryItem } from './types'

const toTokenSet = (text: string): Set<string> =>
  new Set(text.toLowerCase().split(/[^a-zA-Z0-9\p{L}]+/u).map((token) => token.trim()).filter((token) => token.length >= 2))

export function rankByBehavior(items: DiscoveryItem[], favorites: FavoriteItem[], history: ViewHistoryItem[], notifications: MemberNotificationItem[]): DiscoveryItem[] {
  if (items.length <= 1) return items
  const favoriteTokens = new Set(favorites.flatMap((item) => Array.from(toTokenSet(`${item.title} ${item.kind} ${item.sourceSite}`))))
  const historyTokens = new Set(history.slice(0, 20).flatMap((item) => Array.from(toTokenSet(`${item.title} ${item.kind} ${item.sourceSite}`))))
  const noticeTokens = new Set(notifications.slice(0, 20).flatMap((item) => Array.from(toTokenSet(`${item.title} ${item.body} ${item.category}`))))

  const score = (item: DiscoveryItem): number => {
    const tokens = toTokenSet(`${item.title} ${item.summary} ${item.category ?? ''} ${item.tags.join(' ')}`)
    let value = 0
    for (const token of tokens) {
      if (favoriteTokens.has(token)) value += 6
      if (historyTokens.has(token)) value += 3
      if (noticeTokens.has(token)) value += 2
    }
    return value + item.popularityScore + item.displayPriority
  }

  return [...items].sort((a, b) => score(b) - score(a))
}

export function resolveContentTypeLabel(contentType: DiscoveryItem['contentType']): string {
  switch (contentType) {
    case 'product': return 'Product'
    case 'news': return 'News'
    case 'event': return 'Event'
    case 'fanclub': return 'FC'
    case 'faq': return 'FAQ'
    case 'guide': return 'Guide'
    case 'blog': return 'Blog'
    default: return 'Page'
  }
}
