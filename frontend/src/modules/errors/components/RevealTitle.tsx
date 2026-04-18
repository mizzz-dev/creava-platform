import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  text: string
  /** 1単語あたりの遅延 (秒) */
  perWordDelay?: number
  /** 全体開始遅延 (秒) */
  delay?: number
  className?: string
}

/**
 * 単語ごとに stagger reveal するタイトル。
 * - 文字より単語の方が他言語（韓国語/英語）でも自然
 * - reduced motion 時は単に opacity 1 で出す
 */
export default function RevealTitle({ text, perWordDelay = 0.06, delay = 0, className }: Props) {
  const prefersReduced = useReducedMotion()
  const words = text.split(/(\s+)/)

  if (prefersReduced) {
    return <p className={className}>{text}</p>
  }

  return (
    <p className={className}>
      {words.map((w, i) =>
        w.trim().length === 0 ? (
          <span key={i}>{w}</span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: delay + i * perWordDelay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        ),
      )}
    </p>
  )
}
