export type EventType =
  | 'page_view'
  | 'section_view'
  | 'cta_click'
  | 'conversion'
  | 'state_change'
  | 'delivery_event'
  | 'support_event'
  | 'experiment_event'
  | 'ops_event'
  | 'security_event'
  | 'privacy_event'

export type EventCategory =
  | 'navigation'
  | 'commerce'
  | 'membership'
  | 'support'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'experimentation'
  | 'operations'

const EVENT_META: Record<string, { eventType: EventType; eventCategory: EventCategory }> = {
  page_view: { eventType: 'page_view', eventCategory: 'navigation' },
  section_view: { eventType: 'section_view', eventCategory: 'navigation' },
  cta_click: { eventType: 'cta_click', eventCategory: 'navigation' },
  nav_click: { eventType: 'cta_click', eventCategory: 'navigation' },
  form_submit_success: { eventType: 'conversion', eventCategory: 'membership' },
  login_success: { eventType: 'conversion', eventCategory: 'membership' },
  cart_click: { eventType: 'cta_click', eventCategory: 'commerce' },
  notification_open: { eventType: 'delivery_event', eventCategory: 'notifications' },
  notification_click: { eventType: 'delivery_event', eventCategory: 'notifications' },
  support_search: { eventType: 'support_event', eventCategory: 'support' },
  privacy_consent_update: { eventType: 'privacy_event', eventCategory: 'privacy' },
  password_reset_complete: { eventType: 'security_event', eventCategory: 'security' },
  flag_dashboard_view: { eventType: 'ops_event', eventCategory: 'experimentation' },
  experiment_start: { eventType: 'experiment_event', eventCategory: 'experimentation' },
  experiment_pause: { eventType: 'experiment_event', eventCategory: 'experimentation' },
  experiment_complete: { eventType: 'experiment_event', eventCategory: 'experimentation' },
  experiment_stop: { eventType: 'experiment_event', eventCategory: 'experimentation' },
}

export function inferEventMeta(eventName: string): { eventType: EventType; eventCategory: EventCategory } {
  return EVENT_META[eventName] ?? { eventType: 'state_change', eventCategory: 'operations' }
}
