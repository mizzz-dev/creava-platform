import { trackMizzzEvent, type AnalyticsParams } from '@/modules/analytics/tracking'
import type { PlayfulInteractionType } from './types'

export function trackPlayfulInteraction(
  type: PlayfulInteractionType,
  location: string,
  extras?: AnalyticsParams,
): void {
  trackMizzzEvent('playful_interaction', { type, location, ...extras })
}
