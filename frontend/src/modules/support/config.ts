import type { FormDefinition } from '@/modules/contact/lib/formDefinitions'
import type { SourceSite } from '@/types'

export interface SupportCategoryDef {
  key: string
  labelKey: string
  site: SourceSite
  formTypes?: string[]
}

export const SUPPORT_CATEGORIES: SupportCategoryDef[] = [
  { key: 'main-general', labelKey: 'support.categories.mainGeneral', site: 'main', formTypes: ['contact'] },
  { key: 'main-events', labelKey: 'support.categories.mainEvents', site: 'main', formTypes: ['event'] },
  { key: 'main-request', labelKey: 'support.categories.mainRequest', site: 'main', formTypes: ['request', 'collaboration'] },
  { key: 'store-order', labelKey: 'support.categories.storeOrder', site: 'store', formTypes: ['store_support'] },
  { key: 'store-payment', labelKey: 'support.categories.storePayment', site: 'store', formTypes: ['store_support'] },
  { key: 'store-shipping', labelKey: 'support.categories.storeShipping', site: 'store', formTypes: ['store_support'] },
  { key: 'fc-account', labelKey: 'support.categories.fcAccount', site: 'fc', formTypes: ['fc_support'] },
  { key: 'fc-payment', labelKey: 'support.categories.fcPayment', site: 'fc', formTypes: ['fc_support'] },
  { key: 'fc-cancel', labelKey: 'support.categories.fcCancel', site: 'fc', formTypes: ['fc_support'] },
]

export const siteScopedCategories = (site: SourceSite): SupportCategoryDef[] => {
  if (site === 'all') return SUPPORT_CATEGORIES
  return SUPPORT_CATEGORIES.filter((category) => category.site === site || category.site === 'all')
}

export const resolveSiteByForm = (form?: FormDefinition): SourceSite => {
  if (!form) return 'all'
  if (form.sourceSite === 'all') return 'all'
  return form.sourceSite
}

export const normalizeSiteForFilter = (site: 'main' | 'store' | 'fanclub'): SourceSite => {
  if (site === 'fanclub') return 'fc'
  return site
}
