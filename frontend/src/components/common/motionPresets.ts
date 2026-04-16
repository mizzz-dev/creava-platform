import type { Variants, Transition } from 'framer-motion'

/* ── Shared easings ────────────────────────────────── */
const EASE_OUT: [number, number, number, number]    = [0.22, 1, 0.36, 1]
const EASE_SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1]
const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1]

/* ── Shared transitions ─────────────────────────────── */
export const motionTransition = {
  base:   { duration: 0.45, ease: EASE_OUT } as Transition,
  soft:   { duration: 0.6,  ease: EASE_OUT } as Transition,
  hover:  { duration: 0.22, ease: 'easeOut' } as Transition,
  spring: { duration: 0.5,  ease: EASE_SPRING } as Transition,
  smooth: { duration: 0.4,  ease: EASE_SMOOTH } as Transition,
  fast:   { duration: 0.18, ease: 'easeOut' } as Transition,
}

/* ── Preset variants ────────────────────────────────── */
export const motionPresets: Record<string, Variants> = {

  /* ── Legacy (keep existing names working) ─────── */
  heroReveal: {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: motionTransition.soft },
  },
  sectionFadeIn: {
    hidden:  { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: motionTransition.base },
  },
  cardLift: {
    rest:  { y: 0 },
    hover: { y: -4, transition: motionTransition.hover },
  },
  badgePulseSoft: {
    rest:  { scale: 1,    opacity: 0.88 },
    hover: { scale: 1.04, opacity: 1,   transition: motionTransition.hover },
  },
  illustrationFloatSoft: {
    rest:    { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },


  /* ── Cyber-editorial: Entrance ────────────────── */

  /** Clip-path reveal from bottom — cinematic */
  textReveal: {
    hidden:  {
      opacity: 0,
      y: 28,
      clipPath: 'inset(100% 0% 0% 0%)',
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration: 0.65, ease: EASE_OUT },
    },
  },

  /** Soft fade up — subtler than textReveal */
  fadeUp: {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
  },

  /** Scale + fade in */
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1,   transition: { duration: 0.5, ease: EASE_OUT } },
  },

  /** Slide in from left */
  slideInLeft: {
    hidden:  { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0,   transition: { duration: 0.55, ease: EASE_OUT } },
  },

  /** Slide in from right */
  slideInRight: {
    hidden:  { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0,  transition: { duration: 0.55, ease: EASE_OUT } },
  },

  /** Card entrance — deeper lift + slight scale */
  cardReveal: {
    hidden:  { opacity: 0, y: 40, scale: 0.96 },
    visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.6, ease: EASE_OUT } },
  },

  /** Glitch-style reveal — x-jitter then settle */
  glitchReveal: {
    hidden:  { opacity: 0, x: -6, filter: 'blur(2px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.4, ease: EASE_OUT },
    },
  },

  /** Blur to sharp — depth of field effect */
  focusIn: {
    hidden:  { opacity: 0, filter: 'blur(8px)', scale: 1.04 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: 0.7, ease: EASE_SMOOTH },
    },
  },

  /** Cyber scan: fade in with slight Y float, no clip */
  cyberFadeIn: {
    hidden:  { opacity: 0, y: 12, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: EASE_OUT },
    },
  },


  /* ── Stagger containers ───────────────────────── */

  /** Stagger wrapper — children animate with offset */
  staggerContainer: {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  },

  /** Faster stagger — for tight lists */
  staggerFast: {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
  },

  /** Slower stagger — for hero sequences */
  staggerSlow: {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  },


  /* ── Hover states ────────────────────────────── */

  /** Card lift with subtle glow preparation */
  cardHoverLift: {
    rest:  { y: 0, scale: 1 },
    hover: { y: -6, scale: 1.01, transition: motionTransition.hover },
  },

  /** Subtle scale — for badges, icons */
  scalePop: {
    rest:  { scale: 1 },
    hover: { scale: 1.06, transition: { ...motionTransition.hover, ease: EASE_SPRING } },
  },

  /** Arrow nudge right */
  arrowNudge: {
    rest:  { x: 0 },
    hover: { x: 4, transition: motionTransition.hover },
  },

  /** Underline expand */
  underlineExpand: {
    rest:  { scaleX: 0, originX: 0 },
    hover: { scaleX: 1, originX: 0, transition: motionTransition.hover },
  },


  /* ── Continuous animations ───────────────────── */

  /** Continuous vertical float */
  floatContinuous: {
    animate: {
      y: [0, -8, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
  },

  /** Slow float */
  floatSlow: {
    animate: {
      y: [0, -14, 0],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
  },

  /** Pulse opacity */
  pulseOpacity: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },

  /** Spin continuous — for loader rings etc */
  spinContinuous: {
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
  },


  /* ── EC / Store specific ─────────────────────── */

  /** Product card entrance — staggered lift */
  productCardReveal: {
    hidden:  { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.52, ease: EASE_OUT } },
  },

  /** Badge pop — for NEW / LIMITED badges */
  badgePop: {
    hidden:  { opacity: 0, scale: 0.7 },
    visible: { opacity: 1, scale: 1,   transition: { duration: 0.3, ease: EASE_SPRING } },
  },

  /** Price reveal — upward slide */
  priceReveal: {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  },

  /** Hero text stagger — large display text reveal */
  heroTextReveal: {
    hidden:  { opacity: 0, y: 36, clipPath: 'inset(100% 0% 0% 0%)' },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration: 0.75, ease: EASE_OUT },
    },
  },

  /** Section entrance with blur — editorial reveal */
  sectionBlurReveal: {
    hidden:  { opacity: 0, y: 18, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: EASE_SMOOTH },
    },
  },

  /** Horizontal card slide — for featured / spotlight lists */
  cardSlideIn: {
    hidden:  { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0,   transition: { duration: 0.48, ease: EASE_OUT } },
  },

  /** Subtle zoom in — for image reveals */
  imageReveal: {
    hidden:  { opacity: 0, scale: 1.04 },
    visible: { opacity: 1, scale: 1,    transition: { duration: 0.65, ease: EASE_SMOOTH } },
  },

  /** CTA button entrance */
  ctaReveal: {
    hidden:  { opacity: 0, y: 12, scale: 0.96 },
    visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.4, ease: EASE_SPRING } },
  },


  /* ── Page transitions ─────────────────────────── */

  /** Page enter — fade + subtle lift */
  pageEnter: {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  },

  /** Page exit — fade + subtle rise */
  pageExit: {
    visible: { opacity: 1, y: 0 },
    hidden:  { opacity: 0, y: -8, transition: { duration: 0.28, ease: EASE_SMOOTH } },
  },


  /* ── Drawer / modal transitions ───────────────── */

  /** Drawer slide up from bottom */
  drawerReveal: {
    hidden:  { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: '0%', transition: { duration: 0.38, ease: EASE_OUT } },
    exit:    { opacity: 0, y: '100%', transition: { duration: 0.28, ease: EASE_SMOOTH } },
  },

  /** Side panel slide from right */
  panelReveal: {
    hidden:  { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: '0%', transition: { duration: 0.38, ease: EASE_OUT } },
    exit:    { opacity: 0, x: '100%', transition: { duration: 0.28, ease: EASE_SMOOTH } },
  },

  /** Modal scale up from center */
  modalReveal: {
    hidden:  { opacity: 0, scale: 0.92, y: 8 },
    visible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.35, ease: EASE_SPRING } },
    exit:    { opacity: 0, scale: 0.94, y: 4, transition: { duration: 0.22, ease: EASE_SMOOTH } },
  },

  /** Backdrop fade */
  backdropReveal: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit:    { opacity: 0, transition: { duration: 0.2,  ease: 'easeIn' } },
  },


  /* ── Clip-path / cinematic entrances ──────────── */

  /** Clip reveal — dramatic curtain from bottom */
  clipReveal: {
    hidden:  { opacity: 0, y: 24, clipPath: 'inset(100% 0% 0% 0%)' },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration: 0.7, ease: EASE_OUT },
    },
  },

  /** Rise through — deep lift + scale, for hero headings */
  riseThrough: {
    hidden:  { opacity: 0, y: 40, scale: 0.96 },
    visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
  },


  /* ── Loading animations ───────────────────────── */

  /** Loading pulse — for skeleton / placeholder */
  loadingPulse: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
    },
  },

  /** Loading bounce — for 3-dot indicator */
  loadingBounce: {
    animate: {
      y: [0, -6, 0],
      transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' },
    },
  },


  /* ── Decorative background motion ────────────── */

  /** Orb float — for decorative background orbs */
  orbFloat: {
    animate: {
      x: [0, 12, -8, 0],
      y: [0, -16, 8, 0],
      scale: [1, 1.06, 0.97, 1],
      transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
    },
  },

  /** Orb float (slow variant) */
  orbFloatSlow: {
    animate: {
      x: [0, -10, 6, 0],
      y: [0, 12, -10, 0],
      scale: [1, 1.04, 0.98, 1],
      transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
    },
  },

  /** Subtle rotate — for decorative circles/rings */
  rotateSubtle: {
    animate: {
      rotate: [0, 5, -3, 0],
      transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
    },
  },


  /* ── CTA feedback ─────────────────────────────── */

  /** CTA tap — press feedback */
  ctaTap: {
    rest:  { scale: 1 },
    tap:   { scale: 0.97, transition: { duration: 0.1, ease: 'easeIn' } },
    hover: { scale: 1.02, y: -2, transition: motionTransition.hover },
  },

  /** Icon nudge right — for arrow icons in CTA */
  iconNudge: {
    rest:  { x: 0 },
    hover: { x: 5, transition: { ...motionTransition.hover, ease: EASE_SPRING } },
  },


  /* ── Illustration interactions ────────────────── */

  /** Interactive illustration hover */
  illustrationHover: {
    rest:  { y: 0,  scale: 1,    rotate: 0 },
    hover: { y: -8, scale: 1.02, rotate: 0.5, transition: { duration: 0.5, ease: EASE_SPRING } },
  },

  /** Illustration continuous bob */
  illustrationBob: {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 1, -0.5, 0],
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
    },
  },


  /* ── Tab / switch transitions ─────────────────── */

  /** Tab content switch */
  tabSwitch: {
    hidden:  { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: EASE_OUT } },
    exit:    { opacity: 0, x: -6, transition: { duration: 0.18, ease: EASE_SMOOTH } },
  },

  /** Theme switch — smooth reveal on theme change */
  themeSwitch: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  },


  /* ── List / feed animations ───────────────────── */

  /** List item enter — for news/blog feeds */
  listItemReveal: {
    hidden:  { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  },

  /** Notification toast enter */
  toastReveal: {
    hidden:  { opacity: 0, y: -12, scale: 0.96 },
    visible: { opacity: 1, y: 0,   scale: 1, transition: { duration: 0.35, ease: EASE_SPRING } },
    exit:    { opacity: 0, y: -8,  scale: 0.97, transition: { duration: 0.25, ease: EASE_SMOOTH } },
  },
}

export type MotionPresetName = keyof typeof motionPresets
