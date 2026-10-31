import { Bookmark, ChevronLeft, Dices, House, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { cn } from '@/lib/utils'

/** Coluna central com largura de celular, mesmo quando aberto no computador. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto min-h-dvh w-full max-w-md bg-background', className)}>{children}</div>
}

export function BackButton({ to, close = false, label }: { to?: string; close?: boolean; label?: string }) {
  const navigate = useNavigate()
  const Icon = close ? X : ChevronLeft
  const cls =
    'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const aria = label ?? (close ? 'Fechar' : 'Voltar')
  if (to)
    return (
      <Link to={to} aria-label={aria} className={cls}>
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
    <div className="pb-safe fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md border-t border-[#efe9e3] bg-background px-5 pt-3.5">
      {children}
    </div>
  )
}

const tabs = [
  { to: '/', label: 'Início', Icon: House, end: true },
  { to: '/sortear', label: 'Sortear', Icon: Dices, end: false },
  { to: '/visitas', label: 'Visitas', Icon: Bookmark, end: false },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-10 mx-auto grid w-full max-w-md grid-cols-3 border-t border-[#efe9e3] bg-background pt-2"
    >
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex h-12 flex-col items-center justify-center gap-1 text-xs outline-none focus-visible:bg-muted',
              isActive ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
