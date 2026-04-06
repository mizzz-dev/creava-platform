import { useEffect, useState } from 'react'
import { DISPLAY_CURRENCIES, type DisplayCurrency } from '../lib/currency'

const STORAGE_KEY = 'creava:store:displayCurrency'

function isDisplayCurrency(value: string | null): value is DisplayCurrency {
  return value != null && DISPLAY_CURRENCIES.includes(value as DisplayCurrency)
}

export function useDisplayCurrency(defaultCurrency: DisplayCurrency = 'JPY') {
  const [currency, setCurrency] = useState<DisplayCurrency>(defaultCurrency)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isDisplayCurrency(saved)) {
      setCurrency(saved)
    }
  }, [])

  const updateCurrency = (next: DisplayCurrency) => {
    setCurrency(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return {
    currency,
    updateCurrency,
  }
}
