import { RotateCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BackButton, BottomNav, Screen, TopBar } from '@/components/layout'
import { placeMeta, VisitBadge } from '@/components/place-row'
import { PlaceThumb } from '@/components/place-thumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { applyFilters } from '@/lib/utils'

function pickIndex(length: number, avoid: number) {
  if (length <= 1) return 0
  let i = Math.floor(Math.random() * (length - 1))
  if (i >= avoid) i += 1 // nunca repete o anterior
  return i
}

export default function Draw() {
  const { places, filters } = useStore()
  const pool = useMemo(() => applyFilters(places, filters), [places, filters])
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(pool.length, 1)))
  const [round, setRound] = useState(1)
  const place = pool[index % Math.max(pool.length, 1)]

  const active = [
    filters.kids && 'Espaço kids',
    filters.category !== 'Todos' ? filters.category : 'Todas as categorias',
    filters.never && 'Nunca fomos',
    filters.cheap && 'Até $$',
    filters.query && `“${filters.query}”`,
  ].filter(Boolean) as string[]

  return (
    <Screen className="flex flex-col pb-24">
      <TopBar title="Decide pra mim" back={<BackButton to="/" />} />

      <div className="flex flex-wrap items-center gap-1.5 px-5 pt-2">
        {active.map((f) => (
          <span key={f} className="rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background">
            {f}
          </span>
        ))}
        <Link to="/" className="px-1 py-1.5 text-xs font-bold text-primary underline">
          Mudar filtros
        </Link>
      </div>

      {!place ? (
        <div className="m-5 flex flex-col items-start gap-2 rounded-lg bg-muted p-6">
          <span className="text-[15px] font-bold">Nenhum lugar pra sortear</span>
          <span className="text-sm text-muted-foreground">Os filtros atuais não deixaram nenhuma opção.</span>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-6">
            <p className="text-center text-sm font-semibold text-muted-foreground" aria-live="polite">
              {place.visit_count === 0 ? 'Que tal algo novo hoje?' : 'Que tal voltar aqui?'}
            </p>
            <div className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#efe9e3]">
              <PlaceThumb place={place} className="h-55 w-full" iconSize={44} />
              <div className="flex flex-col gap-2 p-4.5">
                <span className="text-2xl leading-tight font-extrabold tracking-tight">{place.name}</span>
                <span className="text-sm font-medium text-muted-foreground">{placeMeta(place)}</span>
                <div className="flex flex-wrap gap-1.5">
                  {place.kids_space && <Badge variant="kids">{place.kids_types[0] ?? 'Espaço kids'}</Badge>}
                  <VisitBadge place={place} />
                </div>
              </div>
            </div>
            <span className="text-center text-xs font-medium text-muted-foreground">
              Sorteio nº {round} · {pool.length} {pool.length === 1 ? 'lugar possível' : 'lugares possíveis'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 px-5 pb-4">
            <Button asChild size="lg">
              <Link to={`/lugar/${place.id}`}>Bora nesse!</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={pool.length < 2}
              onClick={() => {
                setIndex((i) => pickIndex(pool.length, i % pool.length))
                setRound((r) => r + 1)
              }}
            >
              <RotateCw size={18} aria-hidden="true" /> Sortear outro
            </Button>
          </div>
        </>
      )}

      <BottomNav />
    </Screen>
  )
}
