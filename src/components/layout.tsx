import { Bookmark, ChevronLeft, Dices, House, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate, useNavigationType } from 'react-router'
import { Flip, gsap, reducedMotion } from '@/lib/motion'
import { scroller } from '@/lib/scroller'
import { cn } from '@/lib/utils'

type NavState = { tab?: boolean; back?: boolean; toast?: string } | null

/**
 * Coluna central com largura de celular. Cada tela entra com uma animação:
 * desliza da direita ao avançar, da esquerda ao voltar e só aparece entre abas.
 */
/**
 * O fundo vai até a borda, por trás da status bar: o container não tem
 * espaço de safe area. Quem desloca é o header de cada tela.
 */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  const navType = useNavigationType()
  const state = useLocation().state as NavState
  const anim = state?.tab
    ? 'animate-page-fade'
    : navType === 'POP' || state?.back
      ? 'animate-page-back'
      : 'animate-page-forward'
  return (
    <div className={cn('mx-auto min-h-dvh w-full max-w-md bg-background', anim, className)}>{children}</div>
  )
}

const positions = new Map<string, number>()

/**
 * Posição da rolagem entre telas: ao avançar, a tela nova começa do topo;
 * ao voltar, a anterior reaparece onde estava.
 */
export function ScrollManager() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  const state = useLocation().state as NavState
  useLayoutEffect(() => {
    const box = scroller()
    const back = navType === 'POP' || state?.back
    box.scrollTop = back ? (positions.get(pathname) ?? 0) : 0
    return () => {
      positions.set(pathname, box.scrollTop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}

/**
 * Elementos fixos vão direto para o <body>: a animação de entrada da tela usa
 * transform, que faria um position: fixed dentro dela andar junto.
 */
function Fixed({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}

/** Aviso rápido que aparece no rodapé, ex.: navigate(url, { state: { toast: 'Salvo' } }) */
export function Toast() {
  const location = useLocation()
  const message = (location.state as NavState)?.toast
  const [shown, setShown] = useState<{ key: string; text: string } | null>(null)
  useEffect(() => {
    if (!message) return
    setShown({ key: location.key, text: message })
    const t = setTimeout(() => setShown(null), 2600)
    return () => clearTimeout(t)
  }, [message, location.key])
  if (!shown) return null
  return (
    <Fixed>
      <div
        key={shown.key}
        role="status"
        className="animate-toast fixed bottom-28 left-1/2 z-30 rounded-full bg-foreground px-5 py-3 text-sm font-bold whitespace-nowrap text-background shadow-lg"
      >
        {shown.text}
      </div>
    </Fixed>
  )
}

export function BackButton({ to, close = false, label }: { to?: string; close?: boolean; label?: string }) {
  const navigate = useNavigate()
  const Icon = close ? X : ChevronLeft
  const cls =
    'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const aria = label ?? (close ? 'Fechar' : 'Voltar')
  if (to)
    return (
      <Link to={to} state={{ back: true }} aria-label={aria} className={cls}>
        <Icon size={20} strokeWidth={2.2} />
      </Link>
    )
  return (
    <button type="button" aria-label={aria} className={cls} onClick={() => navigate(-1)}>
      <Icon size={20} strokeWidth={2.2} />
    </button>
  )
}

export function TopBar({ title, subtitle, back }: { title: string; subtitle?: string; back: ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-2">
      {back}
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-lg font-extrabold">{title}</h1>
        {subtitle && <span className="truncate text-[13px] font-semibold text-muted-foreground">{subtitle}</span>}
      </div>
    </header>
  )
}

/** Barra fixa no rodapé com a ação principal da tela. */
export function StickyAction({ children }: { children: ReactNode }) {
  return (
    <Fixed>
      <div className="pb-safe animate-rise fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md border-t border-line bg-background px-5 pt-3.5 [animation-delay:120ms]">
        {children}
      </div>
    </Fixed>
  )
}

const tabs = [
  { to: '/', label: 'Início', Icon: House, end: true },
  { to: '/sortear', label: 'Sortear', Icon: Dices, end: false },
  { to: '/visitas', label: 'Visitas', Icon: Bookmark, end: false },
]

// Posição dos botões da barra antes de trocar de aba: a barra nova parte dela
let navState: Flip.FlipState | null = null

/**
 * Barra de abas em pílula, flutuando sobre o conteúdo. A aba ativa vira uma
 * pílula escura com o nome; as outras são botões redondos com borda.
 * Ao trocar de aba, os botões deslizam e mudam de tamanho até a posição nova.
 */
export function BottomNav() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const state = navState
    navState = null
    if (!state || !ref.current || reducedMotion()) return
    Flip.from(state, {
      targets: ref.current.querySelectorAll('[data-flip-id]'),
      duration: 0.5,
      ease: 'power3.out',
    })
    gsap.fromTo(
      ref.current.querySelectorAll('[data-tab-label]'),
      { opacity: 0, x: -6 },
      { opacity: 1, x: 0, duration: 0.35, delay: 0.15, ease: 'power2.out' },
    )
  }, [])

  const remember = () => {
    if (ref.current) navState = Flip.getState(ref.current.querySelectorAll('[data-flip-id]'))
  }

  return (
    <Fixed>
      <nav
        aria-label="Navegação principal"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 pb-4 mx-auto flex w-full max-w-md justify-center bg-gradient-to-t from-background via-background/80 to-transparent pt-6"
      >
        <div
          ref={ref}
          className="pointer-events-auto mb-2 flex items-center gap-1.5 rounded-full border border-line bg-background/90 p-1.5 shadow-[0_12px_32px_-12px_var(--shadow-color)] backdrop-blur-xl"
        >
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              state={{ tab: true }}
              aria-label={label}
              onClick={remember}
              data-flip-id={to}
              className={({ isActive }) =>
                cn(
                  'flex h-13 items-center justify-center gap-2 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'border-foreground bg-foreground pr-5 pl-4 text-background'
                    : 'w-13 border-line bg-background text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" className="shrink-0" />
                  {isActive && (
                    <span data-tab-label className="text-sm font-bold whitespace-nowrap">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </Fixed>
  )
}
