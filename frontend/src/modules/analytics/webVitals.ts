import { useEffect } from 'react'

type SupportedMetricName = 'LCP' | 'CLS' | 'INP'

function pushWebVital(metric: SupportedMetricName, value: number, pageKey: string) {
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
  if (!gtag) return

  gtag('event', 'web_vital', {
    event_category: 'Web Vitals',
    event_label: `${pageKey}:${metric}`,
    page_key: pageKey,
    metric_name: metric,
    value: Math.round(metric === 'CLS' ? value * 1000 : value),
    non_interaction: true,
  })
}

export function useListPageWebVitals(pageKey: string): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return

    let clsValue = 0
    let lcpValue = 0
    let inpValue = 0

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) lcpValue = last.startTime
    })
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      // unsupported
    }

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const shifted = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!shifted.hadRecentInput) clsValue += shifted.value ?? 0
      }
    })
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch {
      // unsupported
    }

    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const next = entry as PerformanceEntry & { duration?: number }
        inpValue = Math.max(inpValue, next.duration ?? 0)
      }
    })
    try {
      inpObserver.observe({ type: 'event', buffered: true } as PerformanceObserverInit)
    } catch {
      // unsupported
    }

    const flush = () => {
      if (lcpValue > 0) pushWebVital('LCP', lcpValue, pageKey)
      pushWebVital('CLS', clsValue, pageKey)
      if (inpValue > 0) pushWebVital('INP', inpValue, pageKey)
    }

    window.addEventListener('pagehide', flush, { once: true })
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
      lcpObserver.disconnect()
      clsObserver.disconnect()
      inpObserver.disconnect()
    }
  }, [pageKey])
}
