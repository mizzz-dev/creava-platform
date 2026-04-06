export const DISPLAY_CURRENCIES = ['JPY', 'USD', 'EUR'] as const

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number]

export type FxRateTable = Record<DisplayCurrency, number>

/**
 * 表示専用の為替レート（基準: 1 JPY）
 * 本実装では静的値を利用し、将来 API 取得へ差し替え可能な形にしている。
 */
const FX_RATES_JPY_BASE: FxRateTable = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
}

export function convertPrice(price: number, baseCurrency: string, displayCurrency: DisplayCurrency): number {
  if (baseCurrency === displayCurrency) return price

  // 基準通貨が JPY 以外の場合は現時点で変換しない（既存互換のため）
  if (baseCurrency !== 'JPY') return price

  const rate = FX_RATES_JPY_BASE[displayCurrency] ?? 1
  return Math.round(price * rate)
}

export function getFxRateUpdatedAt(): string {
  // 将来的に API の取得日時で置き換える
  return '2026-04-06'
}
