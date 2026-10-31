import { Bookmark, ChevronLeft, Dices, House, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate, useNavigationType } from 'react-router'
import { cn } from '@/lib/utils'

type NavState = { tab?: boolean; back?: boolean; toast?: string } | null

/**
 * Coluna central com largura de celular. Cada tela entra com uma animação:
 * desliza da direita ao avançar, da esquerda ao voltar e só aparece entre abas.
 */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  const navType = useNavigationType()
  const state = useLocation().state as NavState
  const anim = state?.tab
    ? 'animate-page-fade'
    : navType === 'POP' || state?.back
      ? 'animate-page-back'
      : 'animate-page-forward'
  return <div className={cn('mx-auto min-h-dvh w-full max-w-md bg-background', anim, className)}>{children}</div>
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
    'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted outline-none transition-transform duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-ring'
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
    <header className="flex items-center gap-3 px-5 pt-5 pb-2">
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

export function BottomNav() {
  return (
    <Fixed>
    <nav
      aria-label="Navegação principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-10 mx-auto grid w-full max-w-md grid-cols-3 border-t border-line bg-background pt-2"
    >
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          state={{ tab: true }}
          className={({ isActive }) =>
            cn(
              'flex h-12 flex-col items-center justify-center gap-1 text-xs outline-none focus-visible:bg-muted',
              isActive ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                key={String(isActive)}
                size={24}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={cn('transition-transform duration-150 active:scale-90', isActive && 'animate-pop')}
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
    </Fixed>
  )
}
