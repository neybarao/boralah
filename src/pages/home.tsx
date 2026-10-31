import { Baby, Dices, Plus, Search, Star } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { BottomNav, Screen } from '@/components/layout'
import { PlaceRow } from '@/components/place-row'
import { PlaceThumb } from '@/components/place-thumb'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { isDemo } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { CATEGORIES } from '@/lib/types'
import { applyFilters, daysSince, DEFAULT_FILTERS, timeAgo } from '@/lib/utils'

const STALE_DAYS = 45

export default function Home() {
  const { places, loading, error, isAdmin, filters, setFilters } = useStore()
  const list = useMemo(() => applyFilters(places, filters), [places, filters])
  const stale = useMemo(
    () =>
      places
        .filter((p) => p.last_visit && daysSince(p.last_visit) >= STALE_DAYS && (!filters.kids || p.kids_space))
        .sort((a, b) => a.last_visit!.localeCompare(b.last_visit!)),
    [places, filters.kids],
  )
  const set = (patch: Partial<typeof filters>) => setFilters({ ...filters, ...patch })

  return (
    <Screen className="pb-28">
      {isDemo && (
        <p className="bg-[#fff4d6] px-5 py-2 text-center text-xs font-semibold text-[#6b4e00]">
          Modo demonstração: dados fictícios salvos só neste aparelho
        </p>
      )}

      <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-muted-foreground">BoraLah</span>
          <h1 className="text-[22px] font-extrabold tracking-tight">Onde comer hoje?</h1>
        </div>
        {isAdmin && (
          <Button asChild variant="muted" size="icon" aria-label="Cadastrar novo lugar">
            <Link to="/novo">
              <Plus size={22} />
            </Link>
          </Button>
        )}
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
        <Chip active={filters.kids} onClick={() => set({ kids: !filters.kids })}>
          <Baby size={16} aria-hidden="true" /> Espaço kids
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
            <span className="text-sm leading-snug font-medium text-[#fff1ec]">
              Sorteia entre {list.length === 1 ? 'o 1 lugar' : `os ${list.length} lugares`} que passam nos seus filtros.
            </span>
          </div>
          <Button asChild variant="inverse" className="self-start">
            <Link to="/sortear">
              <Dices size={18} aria-hidden="true" /> Decide pra mim
            </Link>
          </Button>
        </div>
      </div>

      {stale.length > 0 && (
        <section className="pt-5">
          <h2 className="px-5 text-lg font-extrabold tracking-tight">Faz tempo que não vamos</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pt-3 pb-1">
            {stale.map((p) => (
              <Link key={p.id} to={`/lugar/${p.id}`} className="flex w-33 shrink-0 flex-col gap-2">
                <PlaceThumb place={p} className="h-24 w-33 rounded-lg" />
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

        {loading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>}
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-primary/10 p-4 text-sm font-semibold text-primary">
            Não deu pra carregar os lugares: {error}
          </p>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="mt-4 flex flex-col items-start gap-1.5 rounded-lg bg-muted p-6">
            <span className="text-[15px] font-bold">Nenhum lugar com esses filtros</span>
            <span className="text-sm leading-snug text-muted-foreground">Tente tirar um filtro ou cadastre um lugar novo.</span>
            <Button variant="outline" className="mt-2" onClick={() => setFilters({ ...DEFAULT_FILTERS, kids: false })}>
              Limpar filtros
            </Button>
          </div>
        )}

        <div className="mt-2 flex flex-col">
          {list.map((p) => (
            <PlaceRow key={p.id} place={p} />
          ))}
        </div>
      </section>

      <BottomNav />
    </Screen>
  )
}
