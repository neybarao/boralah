import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

/** Quem pediu menos movimento no sistema recebe transições quase instantâneas */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Curvas usadas no app: entram rápido e assentam devagar, como algo físico */
export const EASE = {
  settle: 'power3.out',
  spring: 'elastic.out(1, 0.5)',
  soft: 'back.out(1.6)',
}

const PRESSABLE = 'button, a, [role="switch"], label:has(input[type="file"])'

/**
 * Toque com mola: ao encostar, o elemento afunda um pouco; ao soltar, volta
 * com um leve quique. Vale para todos os botões, links e chips do app.
 * Elementos que já têm efeito próprio de toque (active:scale) ficam de fora.
 */
export function installPressSpring() {
  if (reducedMotion()) return () => {}
  let current: HTMLElement | null = null

  const release = () => {
    if (!current) return
    gsap.to(current, { scale: 1, duration: 0.7, ease: EASE.spring, overwrite: 'auto' })
    current = null
  }
  const onDown = (e: PointerEvent) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>(PRESSABLE)
    if (!el || el.matches(':disabled') || /active:scale/.test(el.className)) return
    current = el
    // Elementos pequenos afundam mais, grandes menos: parece mais natural
    const { width } = el.getBoundingClientRect()
    const scale = width > 240 ? 0.98 : width > 80 ? 0.96 : 0.9
    gsap.to(el, { scale, duration: 0.14, ease: 'power2.out', overwrite: 'auto' })
  }

  document.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerup', release, { passive: true })
  document.addEventListener('pointercancel', release, { passive: true })
  // Se o dedo arrastar (rolar a lista), solta sem esperar
  document.addEventListener('scroll', release, { passive: true, capture: true })
  return () => {
    document.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerup', release)
    document.removeEventListener('pointercancel', release)
    document.removeEventListener('scroll', release, { capture: true })
  }
}

export { Flip, gsap }
