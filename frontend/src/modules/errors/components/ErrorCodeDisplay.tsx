import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Props {
  code: string
  /** code 影色 (rgba) */
  ghostColor: string
  /** 文字をちょっと glitch させたい場合 true (404 用) */
  glitch?: boolean
  /** マウス追従の角度を強くする（404 のみ on） */
  magnetic?: boolean
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFabcdef01'

/**
 * 巨大エラーコード表示。
 *
 * - ghost layer (blur) + main layer の二重描画
 * - magnetic: マウス追従でほんの少し前傾
 * - glitch: 文字が一瞬乱れて元に戻る (404 用)
 * - reduced motion を尊重
 */
export default function ErrorCodeDisplay({ code, ghostColor, glitch = false, magnetic = false }: Props) {
  const prefersReduced = useReducedMotion()
  const [displayed, setDisplayed] = useState(code)
  const stepRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!glitch || prefersReduced) {
      setDisplayed(code)
      return
    }
    const total = 22
    stepRef.current = 0
    intervalRef.current = setInterval(() => {
      stepRef.current++
      if (stepRef.current >= total) {
        setDisplayed(code)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      const progress = stepRef.current / total
      setDisplayed(
        code
          .split('')
          .map((char, i) => (i / code.length < progress ? char : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]))
          .join(''),
      )
    }, 42)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [code, glitch, prefersReduced])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 90, damping: 20 })
  const rotateX = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 90, damping: 20 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetic || prefersReduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const handleLeave = () => {
    if (!magnetic || prefersReduced) return
    mx.set(0)
    my.set(0)
  }

  return (
    <div
      className="relative mx-auto mb-6 inline-block select-none"
      aria-hidden="true"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: 800 }}
    >
      <span
        className="pointer-events-none absolute inset-0 font-mono font-bold leading-none"
        style={{
          fontSize: 'clamp(5rem, 20vw, 10rem)',
          color: ghostColor,
          filter: 'blur(18px)',
        }}
      >
        {code}
      </span>
      <motion.span
        className="relative inline-block font-mono font-bold leading-none text-gray-100 dark:text-white/[0.05]"
        style={{
          fontSize: 'clamp(5rem, 20vw, 10rem)',
          fontVariantNumeric: 'tabular-nums',
          rotateX: magnetic && !prefersReduced ? rotateX : 0,
          rotateY: magnetic && !prefersReduced ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {displayed}
      </motion.span>
    </div>
  )
}
