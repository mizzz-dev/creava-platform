export type PlayfulSite = 'store' | 'fanclub' | 'main'

export interface DailyMessage {
  id: string
  message: string
  hint?: string
  seasonal?: 'christmas' | 'halloween' | 'newyear'
}

export interface WeeklyPickup {
  id: string
  label: string
  description: string
  href?: string
  seasonal?: string
}

export type PlayfulInteractionType =
  | 'daily_message_view'
  | 'daily_message_click'
  | 'weekly_pickup_click'
  | 'easter_egg_found'
  | 'hidden_quote_revealed'
  | 'surprise_card_open'
  | 'surprise_card_close'
  | 'member_playful_view'
  | 'login_greeting_shown'
  | 'reactive_illustration_hover'
  | 'visit_milestone'
