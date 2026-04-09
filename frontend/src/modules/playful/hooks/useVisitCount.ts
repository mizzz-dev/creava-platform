import { useState } from 'react'
import { incrementVisitCount } from '../storage'
import type { PlayfulSite } from '../types'

/**
 * 初回レンダリング時に訪問回数をインクリメントして返す。
 * React Strict Mode では 2 回呼ばれる可能性があるため、
 * useState の初期化関数でのみ実行する（re-render では実行しない）。
 */
export function useVisitCount(site: PlayfulSite): number {
  const [count] = useState(() => {
    if (typeof window === 'undefined') return 0
    return incrementVisitCount(site)
  })
  return count
}

/** 訪問回数に応じた挨拶文インデックスを返す (0-based, 上限 4) */
export function getVisitGreetingIndex(count: number): number {
  if (count <= 1) return 0
  if (count <= 3) return 1
  if (count <= 10) return 2
  if (count <= 30) return 3
  return 4
}
