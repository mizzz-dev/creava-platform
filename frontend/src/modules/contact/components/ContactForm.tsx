import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useContactForm } from '@/modules/contact/hooks/useContactForm'
import { MAX_FILES, validateFile, validateFiles, FormSubmissionError } from '@/modules/contact/lib/submit'
import { ROUTES } from '@/lib/routeConstants'
import TerminalField from './TerminalField'
import TerminalSelect from './TerminalSelect'

type Step = 'input' | 'confirm'

export default function ContactForm() {
  const { t } = useTranslation()
  const { fields, errors, status, submittedId, errorType, handleChange, validate, confirm, submit, clearStatus, reset } = useContactForm()
  const [step, setStep] = useState<Step>('input')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const categoryOptions = [
    { value: 'general', label: t('contact.categories.general') },
    { value: 'works', label: t('contact.categories.works') },
    { value: 'store', label: t('contact.categories.store') },
    { value: 'fanclub', label: t('contact.categories.fanclub') },
    { value: 'other', label: t('contact.categories.other') },
  ]

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const next = [...files]
    for (const file of selected) {
      const err = validateFile(file)
      if (err) { setFileError(t(`contact.errors.${err}`)); return }
      next.push(file)
    }
    const groupErr = validateFiles(next)
    if (groupErr) { setFileError(t(`contact.errors.${groupErr}`, { max: MAX_FILES })); return }
    setFileError(null)
    setFiles(next)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setConfirmError(null)
    if (!validate()) return
    try {
      await confirm()
      setStep('confirm')
    } catch (error) {
      if (error instanceof FormSubmissionError) {
        setConfirmError(error.message)
      } else {
        setConfirmError(t('contact.errorMessage'))
      }
    }
  }

  async function handleSend() {
    await submit(files)
  }

  function handleReset() {
    setFiles([])
    setFileError(null)
    setConfirmError(null)
    setStep('input')
    reset()
  }

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-10 space-y-5">
        <div className="p-6 border border-emerald-800/40 bg-emerald-950/30">
          <p className="font-mono text-sm text-gray-200">{t('contact.successTitle')}</p>
          <p className="mt-2 text-sm text-gray-400">{t('contact.successMessage')}</p>
          <p className="mt-2 text-xs text-gray-500">#{submittedId ?? '-'} / {new Date().toLocaleString()}</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <button type="button" onClick={handleReset} className="text-gray-500 hover:text-gray-300">{t('contact.sendAnother')}</button>
          <Link to={ROUTES.HOME} className="text-gray-500 hover:text-gray-300">{t('common.backToHome')}</Link>
          <Link to={ROUTES.CONTACT} className="text-gray-500 hover:text-gray-300">{t('contact.backToContactTop')}</Link>
        </div>
      </motion.div>
    )
  }

  if (status === 'error') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-10 space-y-5">
        <div className="p-6 border border-red-800/40 bg-red-950/20">
          <p className="font-mono text-sm text-red-300">{t('contact.resultFailedTitle')}</p>
          <p className="mt-2 text-sm text-gray-400">
            {errorType === 'validation' ? t('contact.errorValidation') : t('contact.errorTemporary')}
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <button type="button" onClick={() => { clearStatus(); setStep('confirm') }} className="text-gray-500 hover:text-gray-300">{t('contact.retry')}</button>
          <button type="button" onClick={() => { clearStatus(); setStep('input') }} className="text-gray-500 hover:text-gray-300">{t('contact.backToEdit')}</button>
          <Link to={ROUTES.CONTACT} className="text-gray-500 hover:text-gray-300">{t('contact.backToContactTop')}</Link>
        </div>
      </motion.div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-5 text-sm">
        <p className="font-mono text-xs text-cyan-400">{t('contact.confirmTitle')}</p>
        <dl className="space-y-2 text-gray-300">
          <div><dt className="text-gray-500">{t('contact.inquiryCategory')}</dt><dd>{categoryOptions.find((option) => option.value === fields.inquiryCategory)?.label ?? '-'}</dd></div>
          <div><dt className="text-gray-500">{t('contact.name')}</dt><dd>{fields.name}</dd></div>
          <div><dt className="text-gray-500">{t('contact.company')}</dt><dd>{fields.companyOrOrganization || '-'}</dd></div>
          <div><dt className="text-gray-500">{t('contact.email')}</dt><dd>{fields.email}</dd></div>
          <div><dt className="text-gray-500">{t('contact.phone')}</dt><dd>{fields.phone || '-'}</dd></div>
          <div><dt className="text-gray-500">{t('contact.subject')}</dt><dd>{fields.subject}</dd></div>
          <div><dt className="text-gray-500">{t('contact.message')}</dt><dd className="whitespace-pre-wrap">{fields.message}</dd></div>
          <div><dt className="text-gray-500">{t('contact.attachFile')}</dt><dd>{files.length > 0 ? files.map((file) => file.name).join(', ') : '-'}</dd></div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setStep('input')} className="font-mono text-xs text-gray-500 hover:text-gray-300">{t('contact.backToEdit')}</button>
          <button type="button" onClick={handleSend} disabled={status === 'submitting'} className="border border-emerald-700 px-4 py-2 font-mono text-xs text-emerald-400 disabled:opacity-50">{status === 'submitting' ? t('contact.submitting') : t('contact.sendConfirmed')}</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleConfirm} noValidate className="space-y-6">
      <div className="hidden"><input name="honeypot" value={fields.honeypot} onChange={handleChange} tabIndex={-1} autoComplete="off" /></div>
      <TerminalField id="contact-name" name="name" label={t('contact.name')} required value={fields.name} onChange={handleChange} error={errors.name} />
      <TerminalField id="contact-company" name="companyOrOrganization" label={t('contact.company')} optional value={fields.companyOrOrganization} onChange={handleChange} error={errors.companyOrOrganization} />
      <TerminalField id="contact-email" name="email" type="email" label={t('contact.email')} required value={fields.email} onChange={handleChange} error={errors.email} />
      <TerminalField id="contact-phone" name="phone" type="tel" label={t('contact.phone')} optional value={fields.phone} onChange={handleChange} error={errors.phone} />
      <TerminalSelect id="contact-category" name="inquiryCategory" label={t('contact.inquiryCategory')} required placeholder={t('contact.selectInquiryCategory')} value={fields.inquiryCategory} onChange={handleChange} options={categoryOptions} error={errors.inquiryCategory} />
      <TerminalField id="contact-subject" name="subject" label={t('contact.subject')} required value={fields.subject} onChange={handleChange} error={errors.subject} />
      <TerminalField id="contact-message" name="message" label={t('contact.message')} multiline rows={6} required value={fields.message} onChange={handleChange} error={errors.message} />
      <div className="space-y-2">
        <label htmlFor="contact-file" className="font-mono text-[11px] text-gray-400">{t('contact.attachFile')} <span className="text-gray-600">({t('contact.maxFiles', { max: MAX_FILES })})</span></label>
        <input ref={fileRef} id="contact-file" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip" onChange={handleFile} className="block w-full text-xs text-gray-400" />
        {files.length > 0 && <ul className="text-xs text-gray-500 space-y-1">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex justify-between"><span>{file.name}</span><button type="button" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))} className="text-red-400">{t('contact.removeFile')}</button></li>)}</ul>}
        {fileError ? <p className="text-xs text-red-400">{fileError}</p> : null}
      </div>
      <label className="flex items-start gap-2 text-xs text-gray-500">
        <input type="checkbox" name="policyAgree" checked={fields.policyAgree} onChange={handleChange} className="mt-0.5" />
        <span>{t('contact.policyAgreePrefix')}<Link to={ROUTES.LEGAL_PRIVACY} className="mx-1 underline">{t('footer.privacy')}</Link>{t('contact.policyAgreeAnd')}<Link to={ROUTES.LEGAL_TERMS} className="mx-1 underline">{t('footer.terms')}</Link>{t('contact.policyAgreeSuffix')}</span>
      </label>
      {errors.policyAgree ? <p className="text-xs text-red-400">{errors.policyAgree}</p> : null}
      {confirmError ? <p className="text-xs text-red-400">{confirmError}</p> : null}
      <button type="submit" className="group flex items-center gap-2 border border-emerald-700 hover:border-emerald-500 hover:bg-emerald-950/40 px-6 py-2.5 font-mono text-sm text-emerald-400">{t('contact.toConfirm')}</button>
    </form>
  )
}
