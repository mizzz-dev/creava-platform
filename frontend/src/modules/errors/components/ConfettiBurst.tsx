import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface BurstParticle {
  id: number
  angle: number
  distance: number
  size: number
  hueClass: string
  delay: number
}

const HUES = [
  'bg-violet-400/70 dark:bg-violet-300/65',
  'bg-amber-300/70 dark:bg-amber-300/65',
  'bg-cyan-300/70 dark:bg-cyan-300/60',
  'bg-rose-300/65 dark:bg-rose-300/55',
  'bg-white/70 dark:bg-white/40',
]

function buildBurst(seed: number): BurstParticle[] {
  const count = 14
  const particles: BurstParticle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + (seed * 13) % 30
    particles.push({
      id: seed * 1000 + i,
      angle,
      distance: 38 + ((seed + i) * 7) % 22,
      size: 4 + ((seed + i) % 3),
      hueClass: HUES[(seed + i) % HUES.length],
      delay: ((seed + i) % 5) * 0.02,
    })
  }
  return particles
}

interface Props {
  /** Render kicked off whenever this value increments */
  trigger: number
  /** size of the bounding region in px (square) */
  size?: number
}

/**
 * タップ時に弾ける小さなパーティクル。
 * - reduced motion 時は何も出さない
 * - 1 バーストあたり ~700ms で消える
 * - JS タイマーで dom から外し、メモリリークを防ぐ
 */
export default function ConfettiBurst({ trigger, size = 160 }: Props) {
  const prefersReduced = useReducedMotion()
  const [bursts, setBursts] = useState<{ id: number; particles: BurstParticle[] }[]>([])

  useEffect(() => {
    if (prefersReduced || trigger <= 0) return
    const id = trigger
    setBursts(prev => [...prev, { id, particles: buildBurst(id) }])
    const timer = window.setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id))
    }, 850)
    return () => window.clearTimeout(timer)
  }, [trigger, prefersReduced])

  if (prefersReduced) return null

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {bursts.map(burst => (
          <div key={burst.id} className="absolute inset-0">
            {burst.particles.map(p => {
              const rad = (p.angle * Math.PI) / 180
              const dx = Math.cos(rad) * p.distance
              const dy = Math.sin(rad) * p.distance
              return (
                <motion.span
                  key={p.id}
                  className={`absolute left-1/2 top-1/2 rounded-full ${p.hueClass}`}
                  style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.6], x: dx, y: dy }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: p.delay }}
                />
              )
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
