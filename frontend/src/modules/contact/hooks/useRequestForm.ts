import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isRequired, isEmail, isMinLength } from '@/modules/contact/lib/validation'
import { confirmRequest, submitRequest, type RequestPayload, FormSubmissionError } from '@/modules/contact/lib/submit'

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

type Fields = Omit<RequestPayload, 'files'>

type Errors = Partial<Record<keyof Fields, string>>

const DRAFT_KEY = 'request-form-draft-v2'

const initialFields: Fields = {
  inquiryCategory: '',
  name: '',
  email: '',
  company: '',
  phone: '',
  subject: '',
  requestType: '',
  budget: '',
  deadline: '',
  detail: '',
  policyAgree: false,
  honeypot: '',
}

export function useRequestForm() {
  const { t, i18n } = useTranslation()
  const [fields, setFields] = useState<Fields>(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      return raw ? { ...initialFields, ...(JSON.parse(raw) as Partial<Fields>) } : initialFields
    } catch {
      return initialFields
    }
  })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [submittedId, setSubmittedId] = useState<number | null>(null)
  const [errorType, setErrorType] = useState<'validation' | 'temporary' | 'network' | null>(null)

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(fields))
  }, [fields])

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target
    const nextValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFields((prev) => ({ ...prev, [name]: nextValue }))
    if (errors[name as keyof Fields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function validate(): boolean {
    const next: Errors = {}
    if (!isRequired(fields.name)) next.name = t('contact.errors.required')
    if (!isRequired(fields.inquiryCategory)) next.inquiryCategory = t('contact.errors.required')
    if (!isRequired(fields.email)) {
      next.email = t('contact.errors.required')
    } else if (!isEmail(fields.email)) {
      next.email = t('contact.errors.emailFormat')
    }
    if (!isRequired(fields.subject)) next.subject = t('contact.errors.required')
    if (!isRequired(fields.requestType)) {
      next.requestType = t('contact.errors.required')
    }
    if (!isMinLength(fields.detail, 10)) {
      next.detail = t('contact.errors.minLength', { min: 10 })
    }
    if (!fields.policyAgree) {
      next.policyAgree = t('contact.errors.policyRequired')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function confirm() {
    await confirmRequest({ ...fields, locale: i18n.language, sourcePage: '/contact?tab=request' })
  }

  async function submit(files: File[]) {
    setStatus('submitting')
    setErrorType(null)
    try {
      const result = await submitRequest({
        ...fields,
        files,
        locale: i18n.language,
        sourcePage: '/contact?tab=request',
      })
      setStatus('success')
      setSubmittedId(result.id)
      window.localStorage.removeItem(DRAFT_KEY)
    } catch (error) {
      setStatus('error')
      setErrorType(error instanceof FormSubmissionError ? error.kind : 'network')
    }
  }

  function clearStatus() {
    if (status !== 'idle') setStatus('idle')
    setErrorType(null)
  }

  function reset() {
    setFields(initialFields)
    setErrors({})
    setStatus('idle')
    setSubmittedId(null)
    setErrorType(null)
    window.localStorage.removeItem(DRAFT_KEY)
  }

  return { fields, errors, status, submittedId, errorType, handleChange, validate, confirm, submit, clearStatus, reset }
}
