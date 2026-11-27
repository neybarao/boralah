import { Clock, Dices, LogIn, Moon, Plus, Search, Star, Sun } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type React from 'react'
import { Link } from 'react-router'
import { BottomNav, Screen } from '@/components/layout'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { BUILD_TIME, checkForUpdate } from '@/lib/sw-update'
import { AnimatedNumber } from '@/components/animated-number'
import { PlaceRow } from '@/components/place-row'
import { PlaceThumb } from '@/components/place-thumb'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { isDemo } from '@/lib/supabase'
import { Flip, gsap, reducedMotion } from '@/lib/motion'
import { useStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { CATEGORIES } from '@/lib/types'
import { applyFilters, daysSince, DEFAULT_FILTERS, timeAgo } from '@/lib/utils'

const STALE_DAYS = 45

export default function Home() {
  const { places, loading, error, isAdmin, filters, setFilters, refresh } = useStore()
  const { theme, toggle } = useTheme()
  const list = useMemo(() => applyFilters(places, filters), [places, filters])
  const stale = useMemo(
    () =>
      places
        .filter((p) => p.last_visit && daysSince(p.last_visit) >= STALE_DAYS && p.kids_space)
        .sort((a, b) => a.last_visit!.localeCompare(b.last_visit!)),
    [places],
  )
  const listRef = useRef<HTMLDivElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  // Antes de trocar o filtro, guarda onde cada lugar estava
  const set = (patch: Partial<typeof filters>) => {
    if (listRef.current && !reducedMotion()) flipState.current = Flip.getState(listRef.current.children)
    setFilters({ ...filters, ...patch })
  }

  // Depois de trocar, os lugares que ficaram deslizam até a posição nova
  useLayoutEffect(() => {
    const state = flipState.current
    flipState.current = null
    if (!state || !listRef.current) return
    Flip.from(state, {
      targets: listRef.current.children,
      duration: 0.55,
      ease: 'power3.out',
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.03 }),
    })
  }, [list])

  return (
    <Screen className="pb-28">
      <PullToRefresh onRefresh={() => Promise.all([refresh(), checkForUpdate({ wait: true })])} />
      {isDemo && (
        <p className="bg-notice px-5 py-2 text-center text-xs font-semibold text-notice-foreground">
          Modo demonstração: dados fictícios salvos só neste aparelho
        </p>
      )}

      <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-muted-foreground">BoraLah</span>
          <h1 className="text-[22px] font-extrabold tracking-tight">Onde comer hoje?</h1>
          <span className="text-[13px] font-medium text-muted-foreground">Só lugares com espaço kids</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="muted"
            size="icon"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
          >
            {theme === 'dark' ? (
              <Sun key="sun" size={21} className="animate-pop" />
            ) : (
              <Moon key="moon" size={20} className="animate-pop" />
            )}
          </Button>
          {!isDemo && !isAdmin && (
            <Button asChild variant="muted" size="icon" aria-label="Entrar para editar">
              <Link to="/entrar">
                <LogIn size={20} />
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button asChild variant="muted" size="icon" aria-label="Cadastrar novo lugar">
              <Link to="/novo">
                <Plus size={22} />
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="px-5 pt-2 pb-1">
        <label className="flex h-12 items-center gap-2.5 rounded-full bg-muted px-4.5">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Buscar lugar, comida ou bairro"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4 pb-1">
        {['Todos', ...CATEGORIES].map((c) => (
          <Chip key={c} tone="primary" active={filters.category === c} onClick={() => set({ category: c })}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-2 pb-1">
        <Chip active={filters.open} onClick={() => set({ open: !filters.open })}>
          <Clock size={16} aria-hidden="true" /> Aberto agora
        </Chip>
        <Chip active={filters.never} onClick={() => set({ never: !filters.never })}>
          <Star size={16} aria-hidden="true" /> Nunca fomos
        </Chip>
        <Chip active={filters.cheap} onClick={() => set({ cheap: !filters.cheap })}>
          Até $$
        </Chip>
      </div>

      <div className="px-5 pt-4 pb-2">
        <div className="flex flex-col gap-3.5 rounded-xl bg-primary p-5 text-primary-foreground">
          <div className="flex flex-col gap-1">
            <span className="text-xl leading-tight font-extrabold">Sem ideia? A gente escolhe.</span>
            <span className="text-sm leading-snug font-medium text-primary-soft-foreground">
              Sorteia entre {list.length === 1 ? 'o' : 'os'}{' '}
              <AnimatedNumber value={list.length} className="font-extrabold text-primary-foreground" />{' '}
              {list.length === 1 ? 'lugar' : 'lugares'} que passam nos seus filtros.
            </span>
          </div>
          <Button asChild variant="inverse" className="group self-start">
            <Link to="/sortear">
              <Dices
                size={18}
                aria-hidden="true"
                className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[200deg] group-active:rotate-[200deg]"
              />{' '}
              Decide pra mim
            </Link>
          </Button>
        </div>
      </div>

      {stale.length > 0 && (
        <section className="pt-5">
          <h2 className="px-5 text-lg font-extrabold tracking-tight">Faz tempo que não vamos</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pt-3 pb-1">
            {stale.map((p, i) => (
              <Link
                key={p.id}
                to={`/lugar/${p.id}`}
                style={{ '--i': i } as React.CSSProperties}
                className="group animate-rise stagger flex w-33 shrink-0 flex-col gap-2"
              >
                <PlaceThumb
                  place={p}
                  className="h-24 w-33 rounded-lg transition-transform duration-200 ease-out group-active:scale-95"
                />
                <span className="text-sm leading-tight font-bold">{p.name}</span>
                <span className="text-xs font-medium text-muted-foreground">Última vez {timeAgo(p.last_visit!)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Todos os lugares</h2>
          <span className="text-[13px] font-semibold text-muted-foreground">
            {list.length === 1 ? '1 lugar' : `${list.length} lugares`}
          </span>
        </div>

        {loading && (
          <div aria-label="Carregando" className="mt-2 flex flex-col">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3.5 border-b border-line py-3">
                <div className="animate-shimmer size-21 rounded-lg bg-muted" />
                <div className="flex flex-1 flex-col justify-center gap-2">
                  <div className="animate-shimmer h-4 w-2/3 rounded bg-muted" />
                  <div className="animate-shimmer h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-primary/10 p-4 text-sm font-semibold text-primary">
            Não deu pra carregar os lugares: {error}
          </p>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="animate-rise mt-4 flex flex-col items-start gap-1.5 rounded-lg bg-muted p-6">
            <span className="text-[15px] font-bold">Nenhum lugar com esses filtros</span>
            <span className="text-sm leading-snug text-muted-foreground">Tente tirar um filtro ou cadastre um lugar novo.</span>
            <Button variant="outline" className="mt-2" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Limpar filtros
            </Button>
          </div>
        )}

        <div ref={listRef} className="mt-2 flex flex-col">
          {list.map((p, i) => (
            <div key={p.id} data-flip-id={p.id}>
              <PlaceRow place={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      <p className="px-5 pt-8 text-center text-[11px] font-medium text-muted-foreground">
        Versão de{' '}
        {BUILD_TIME.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </p>

      <BottomNav />
    </Screen>
  )
}
