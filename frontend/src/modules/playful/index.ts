// Types
export type { DailyMessage, WeeklyPickup, PlayfulInteractionType, PlayfulSite } from './types'

// Storage
export {
  getVisitCount,
  incrementVisitCount,
  isEasterEggFound,
  markEasterEggFound,
  isDismissed,
  markDismissed,
} from './storage'

// Hooks
export { useDailyVariant, useWeeklyVariant, getDailyIndex, getWeeklyIndex } from './hooks/useDailyVariant'
export { useEasterEgg } from './hooks/useEasterEgg'
export { useVisitCount, getVisitGreetingIndex } from './hooks/useVisitCount'

// Tracking
export { trackPlayfulInteraction } from './tracking'

// Components
export { default as DailyMessageCard } from './components/DailyMessageCard'
export { default as SurpriseCard } from './components/SurpriseCard'
export { default as HiddenQuote } from './components/HiddenQuote'
export { default as EasterEggTrigger } from './components/EasterEggTrigger'
export { default as MemberPlayfulBlock } from './components/MemberPlayfulBlock'
export { default as WeeklyPickupCard } from './components/WeeklyPickupCard'
