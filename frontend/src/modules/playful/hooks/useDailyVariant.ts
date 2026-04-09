/**
 * 日付・週ベースの安定したインデックスを返すフック。
 * ページ再読み込みや複数タブで一貫した値が返るよう、
 * 乱数ではなく日付をシードとして使用する。
 */

function twoDigit(n: number): string {
  return String(n).padStart(2, '0')
}

/** 今日のシード値 (YYYYMMDD を整数化) */
function getDailySeed(): number {
  const d = new Date()
  return parseInt(`${d.getFullYear()}${twoDigit(d.getMonth() + 1)}${twoDigit(d.getDate())}`, 10)
}

/** 今週のシード値 (ISO週番号 × 年) */
function getWeeklySeed(): number {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7,
  )
  return d.getFullYear() * 100 + weekNum
}

/**
 * プール配列から今日の1件を返す。
 * 同日中は常に同じ要素を返す。
 */
export function useDailyVariant<T>(pool: T[]): T | null {
  if (pool.length === 0) return null
  return pool[getDailySeed() % pool.length]
}

/**
 * プール配列から今週の1件を返す。
 * 同週内は常に同じ要素を返す。
 */
export function useWeeklyVariant<T>(pool: T[]): T | null {
  if (pool.length === 0) return null
  return pool[getWeeklySeed() % pool.length]
}

/**
 * 日替わりインデックスを数値で返す（複数プールを同期させたいとき用）
 */
export function getDailyIndex(poolSize: number): number {
  return getDailySeed() % poolSize
}

export function getWeeklyIndex(poolSize: number): number {
  return getWeeklySeed() % poolSize
}
