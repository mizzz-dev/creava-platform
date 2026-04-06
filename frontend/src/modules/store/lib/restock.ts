export interface RestockRequestPayload {
  email: string
  productId: number
  productSlug: string
  productTitle: string
  locale: string
}

const RESTOCK_FORM_ID = import.meta.env.VITE_FORMSPREE_RESTOCK_ID as string | undefined

export async function submitRestockRequest(payload: RestockRequestPayload): Promise<void> {
  if (!RESTOCK_FORM_ID) {
    if (import.meta.env.DEV) {
      console.warn('[store] VITE_FORMSPREE_RESTOCK_ID is not set. Using dev stub (no email sent).')
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 700))
    return
  }

  const fd = new FormData()
  fd.append('_subject', `[再入荷通知] ${payload.productTitle}`)
  fd.append('_replyto', payload.email)
  fd.append('email', payload.email)
  fd.append('productId', String(payload.productId))
  fd.append('productSlug', payload.productSlug)
  fd.append('productTitle', payload.productTitle)
  fd.append('locale', payload.locale)
  fd.append('source', 'store-detail')

  const res = await fetch(`https://formspree.io/f/${RESTOCK_FORM_ID}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: fd,
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
}
