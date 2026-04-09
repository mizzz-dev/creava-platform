import { useState, useCallback } from 'react'
import { isEasterEggFound, markEasterEggFound } from '../storage'
import { trackPlayfulInteraction } from '../tracking'

interface UseEasterEggOptions {
  id: string
  /** 発火に必要なクリック数 (default: 5) */
  triggerCount?: number
  location?: string
}

interface UseEasterEggReturn {
  found: boolean
  clickCount: number
  isClose: boolean   // あと1回で発火する
  handleClick: () => void
}

/**
 * 特定のID に紐づくイースターエッグトリガー。
 * 既に発見済みなら found=true で初期化される。
 */
export function useEasterEgg({
  id,
  triggerCount = 5,
  location = 'unknown',
}: UseEasterEggOptions): UseEasterEggReturn {
  const [found, setFound] = useState(() =>
    typeof window !== 'undefined' ? isEasterEggFound(id) : false,
  )
  const [clickCount, setClickCount] = useState(0)

  const handleClick = useCallback(() => {
    if (found) return
    setClickCount((prev) => {
      const next = prev + 1
      if (next >= triggerCount) {
        setFound(true)
        markEasterEggFound(id)
        trackPlayfulInteraction('easter_egg_found', location, { egg_id: id })
      }
      return next
    })
  }, [found, id, location, triggerCount])

  return {
    found,
    clickCount,
    isClose: !found && clickCount >= triggerCount - 1,
    handleClick,
  }
}
