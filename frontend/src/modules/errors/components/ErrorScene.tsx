import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useCallback, type ReactNode } from 'react'
import type { ErrorSiteVariant } from '@/modules/errors/siteVariants'

interface Props {
  variant: ErrorSiteVariant
  children: ReactNode
  /** マウス追従パララックスの強さ */
  parallaxStrength?: number
  /** カーソル追従スポットライトの有無 */
  spotlight?: boolean
  className?: string
}

/**
 * エラーページ共通の背景演出 + parallax レイアウト。
 *
 * - subtle grid background（dark/light どちらでも目立ちすぎない）
 * - ambient orb (slow scale)
 * - 4隅のブラケット（ブランドフレーム感）
 * - floating shape (rotating ring × 2 + sparks)
 * - parallax: 背景レイヤだけ薄くマウス追従
 * - spotlight: 任意でカーソル追従の柔らかいハイライト
 *
 * 子要素 (中央コンテンツ) はそのまま z-10 に配置される前提。
 */
export default function ErrorScene({ variant, children, parallaxStrength = 10, spotlight = true, className }: Props) {
  const prefersReduced = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotX = useMotionValue(0.5)
  const spotY = useMotionValue(0.5)

  const parallaxX = useSpring(useTransform(mouseX, [-1, 1], [-parallaxStrength, parallaxStrength]), {
    stiffness: 80, damping: 18,
  })
  const parallaxY = useSpring(useTransform(mouseY, [-1, 1], [-parallaxStrength, parallaxStrength]), {
    stiffness: 80, damping: 18,
  })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced) return
    const { innerWidth, innerHeight } = window
    mouseX.set((e.clientX / innerWidth - 0.5) * 2)
    mouseY.set((e.clientY / innerHeight - 0.5) * 2)
    spotX.set(e.clientX / innerWidth)
    spotY.set(e.clientY / innerHeight)
  }, [prefersReduced, mouseX, mouseY, spotX, spotY])

  return (
    <section
      className={`relative flex min-h-[84vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center ${className ?? ''}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
        style={prefersReduced ? undefined : { x: parallaxX, y: parallaxY }}
      >
        {/* fine grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,100,120,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,120,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* ambient orb */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${variant.glow} 0%, transparent 70%)` }}
          animate={prefersReduced ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* corner brackets */}
        <div className={`absolute left-6 top-6 h-10 w-10 border-l-2 border-t-2 ${variant.bracket}`} />
        <div className={`absolute right-6 top-6 h-10 w-10 border-r-2 border-t-2 ${variant.bracket}`} />
        <div className={`absolute bottom-6 left-6 h-10 w-10 border-b-2 border-l-2 ${variant.bracket}`} />
        <div className={`absolute bottom-6 right-6 h-10 w-10 border-b-2 border-r-2 ${variant.bracket}`} />

        {!prefersReduced && (
          <>
            {/* slow rotating ring */}
            <motion.div
              className={`absolute right-[6%] top-[12%] h-44 w-44 rounded-full border ${variant.shapeBorder}`}
              animate={{ rotate: 360 }}
              transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className={`absolute bottom-[16%] left-[7%] h-24 w-24 rounded-full border ${variant.shapeBorder}`}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />

            {/* slow drifting shape */}
            <motion.div
              className={`absolute bottom-[22%] right-[10%] h-14 w-14 border ${variant.shapeBorder}`}
              animate={{ rotate: [0, 45, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* drifting sparks */}
            {[
              { top: '22%', left: '32%', delay: 0.4, size: 2 },
              { top: '64%', left: '70%', delay: 1.6, size: 1.6 },
              { top: '46%', left: '16%', delay: 2.6, size: 2.4 },
            ].map((p, i) => (
              <motion.span
                key={i}
                className={`absolute rounded-full ${variant.sparkBg}`}
                style={{ top: p.top, left: p.left, width: p.size * 2, height: p.size * 2 }}
                animate={{ opacity: [0, 0.85, 0], y: [0, -22, -42], scale: [0.6, 1, 0.6] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeOut', delay: p.delay }}
              />
            ))}

            {/* vertical accent line */}
            <motion.div
              className="absolute right-[18%] top-[34%] h-24 w-px bg-gradient-to-b from-transparent via-gray-300/40 to-transparent dark:via-white/10"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* cursor spotlight (very soft) */}
        {spotlight && !prefersReduced && (
          <Spotlight x={spotX} y={spotY} color={variant.glow} />
        )}
      </motion.div>

      {children}
    </section>
  )
}

function Spotlight({ x, y, color }: { x: MotionValue<number>; y: MotionValue<number>; color: string }) {
  const cx = useTransform(x, v => `${v * 100}%`)
  const cy = useTransform(y, v => `${v * 100}%`)
  // build a radial-gradient with motion values (template literal via useTransform)
  const bg = useTransform([cx, cy] as [MotionValue<string>, MotionValue<string>], ([px, py]) =>
    `radial-gradient(360px circle at ${px} ${py}, ${color}, transparent 70%)`,
  )
  return (
    <motion.div
      className="absolute inset-0 mix-blend-normal"
      style={{ background: bg }}
    />
  )
}
