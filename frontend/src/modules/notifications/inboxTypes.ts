export type MessageType =
  | 'important_notice'
  | 'membership_update'
  | 'fc_update'
  | 'store_update'
  | 'support_notice'
  | 'security_notice'
  | 'campaign_notice'
  | 'seasonal_notice'
  | 'rejoin_notice'
  | 'renewal_notice'

export type MessageCategory = 'account' | 'membership' | 'store' | 'fc' | 'support' | 'security' | 'campaign' | 'seasonal'
export type MessageSeverity = 'critical' | 'high' | 'medium' | 'low'
export type MessagePriority = 'high' | 'normal'
export type MessageVisibilityState = 'hidden' | 'visible' | 'emphasized' | 'modal_like' | 'banner_like' | 'inbox_only'
export type DeliveryState = 'pending' | 'delivered' | 'failed' | 'skipped' | 'suppressed'
export type ReadState = 'unread' | 'seen' | 'read'
export type ArchiveState = 'active' | 'archived'
export type DismissState = 'active' | 'dismissed'

export type InboxMessage = {
  messageId: string
  title: string
  body: string
  href: string | null
  sourceSite: 'main' | 'store' | 'fc' | 'cross'
  messageType: MessageType
  messageCategory: MessageCategory
  messageSeverity: MessageSeverity
  messagePriority: MessagePriority
  messageVisibilityState: MessageVisibilityState
  deliveryState: DeliveryState
  readState: ReadState
  archiveState: ArchiveState
  dismissState: DismissState
  messageReason: string | null
  messageMetadata: Record<string, unknown>
  visibleFromAt: string | null
  expiresAt: string | null
  deliveredAt: string | null
  firstSeenAt: string | null
  readAt: string | null
  archivedAt: string | null
  dismissedAt: string | null
}

export type InboxSummary = {
  total: number
  unread: number
  read: number
  archived: number
  dismissed: number
  important: number
  actionRequired: number
  byCategory: Record<string, number>
}

export type DeliverySummary = {
  total: number
  delivered: number
  pending: number
  failed: number
  skipped: number
  suppressed: number
}

export type NotificationPreferenceState = {
  inAppOptIn: boolean
  emailOptIn: boolean
  notificationConsentState: string
  crmConsentState: string
}

export type NotificationInboxResponse = {
  inboxSummary: InboxSummary
  deliverySummary: DeliverySummary
  unreadSummary: {
    total: number
    important: number
    actionRequired: number
  }
  preferenceState: NotificationPreferenceState
  messages: InboxMessage[]
}
