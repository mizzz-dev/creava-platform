import type { PropsWithChildren } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSeasonalTheme } from '@/modules/seasonal/context'

interface SectionRevealProps extends PropsWithChildren {
  className?: string
  delay?: number
  /** アニメーション種別: デフォルト=fadeUp, blur=ブラー, slide=スライド */
  variant?: 'fadeUp' | 'blur' | 'slideLeft' | 'scaleIn'
}

export default function SectionReveal({ children, className, delay = 0, variant = 'fadeUp' }: SectionRevealProps) {
  const reduceMotion = useReducedMotion()
  const { config } = useSeasonalTheme()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const duration = config.scrollPreset === 'soft' ? 0.65 : config.scrollPreset === 'dramatic' ? 0.55 : 0.55
  const offset   = config.scrollPreset === 'dramatic' ? 28 : 18

  const variants = {
    fadeUp: {
      hidden:  { opacity: 0, y: offset },
      visible: { opacity: 1, y: 0 },
    },
    blur: {
      hidden:  { opacity: 0, y: offset * 0.7, filter: 'blur(6px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    slideLeft: {
      hidden:  { opacity: 0, x: -24 },
      visible: { opacity: 1, x: 0 },
    },
    scaleIn: {
      hidden:  { opacity: 0, scale: 0.94 },
      visible: { opacity: 1, scale: 1 },
    },
  } as const

  const chosen = variants[variant]

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={chosen}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
