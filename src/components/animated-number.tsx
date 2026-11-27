import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '@/lib/motion'

/** Número que desliza até o valor novo em vez de trocar de repente */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const shown = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) {
      shown.current = value
      el.textContent = String(value)
      return
    }
    const state = { n: shown.current }
    const tween = gsap.to(state, {
      n: value,
      duration: 0.6,
      ease: 'power3.out',
      onUpdate: () => {
        shown.current = Math.round(state.n)
        el.textContent = String(shown.current)
      },
    })
    // Um pulinho quando muda
    gsap.fromTo(el, { scale: 1.25 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    return () => {
      tween.kill()
    }
  }, [value])

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block' }}>
      {shown.current}
    </span>
  )
}
