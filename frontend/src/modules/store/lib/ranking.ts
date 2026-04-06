import type { StoreProductSummary } from '../types'

export type RankingRange = '7d' | '30d'

const MOCK_SALES_METRICS: Record<number, { soldCount7d: number; soldCount30d: number }> = {
  1: { soldCount7d: 12, soldCount30d: 49 },
  2: { soldCount7d: 18, soldCount30d: 57 },
  3: { soldCount7d: 6, soldCount30d: 35 },
  4: { soldCount7d: 9, soldCount30d: 33 },
  6: { soldCount7d: 15, soldCount30d: 51 },
  7: { soldCount7d: 5, soldCount30d: 22 },
  8: { soldCount7d: 3, soldCount30d: 18 },
  10: { soldCount7d: 7, soldCount30d: 27 },
}

export function getRankedProducts(products: StoreProductSummary[], range: RankingRange, limit = 3): StoreProductSummary[] {
  const getCount = (id: number) => {
    const metric = MOCK_SALES_METRICS[id]
    if (!metric) return 0
    return range === '7d' ? metric.soldCount7d : metric.soldCount30d
  }

  return [...products]
    .filter((product) => product.purchaseStatus !== 'coming_soon')
    .sort((a, b) => getCount(b.id) - getCount(a.id))
    .slice(0, limit)
}
