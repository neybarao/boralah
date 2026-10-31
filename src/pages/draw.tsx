import { Dices } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { BackButton, BottomNav, Screen, TopBar } from '@/components/layout'
import { placeMeta, VisitBadge } from '@/components/place-row'
import { PlaceThumb } from '@/components/place-thumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { applyFilters, cn } from '@/lib/utils'

/** Sorteia um índice diferente do anterior. */
function pickIndex(length: number, avoid: number) {
  if (length <= 1) return 0
  let i = Math.floor(Math.random() * (length - 1))
  if (i >= avoid) i += 1
  return i
}

// Intervalos entre as trocas do "embaralhar": começa rápido e vai freando.
const TICKS = [55, 60, 65, 75, 85, 100, 120, 150, 190, 240]

export default function Draw() {
  const { places, filters } = useStore()
  const pool = useMemo(() => applyFilters(places, filters), [places, filters])
  const [index, setIndex] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [round, setRound] = useState(0)
  const timers = useRef<number[]>([])

  const roll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (pool.length < 2) {
      setIndex(0)
      setRound((r) => r + 1)
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ticks = reduce ? [] : TICKS
    setRolling(true)
    let current = index
    let elapsed = 0
    for (const delay of ticks) {
      elapsed += delay
      timers.current.push(
        window.setTimeout(() => {
          current = pickIndex(pool.length, current)
          setIndex(current)
        }, elapsed),
      )
    }
    timers.current.push(
      window.setTimeout(() => {
        setIndex(pickIndex(pool.length, current))
        setRolling(false)
        setRound((r) => r + 1)
        navigator.vibrate?.(12) // vibra no Android; o iPhone não permite
      }, elapsed + 60),
    )
  }, [pool.length, index])

  // Sorteia ao abrir a tela
  useEffect(() => {
    roll()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length])

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
        <Link to="/" state={{ back: true }} className="px-1 py-1.5 text-xs font-bold text-primary underline">
          Mudar filtros
        </Link>
      </div>

      {!place ? (
        <div className="animate-rise m-5 flex flex-col items-start gap-2 rounded-lg bg-muted p-6">
          <span className="text-[15px] font-bold">Nenhum lugar pra sortear</span>
          <span className="text-sm text-muted-foreground">Os filtros atuais não deixaram nenhuma opção.</span>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-6">
            <p className="h-5 text-center text-sm font-semibold text-muted-foreground" aria-live="polite">
              {rolling ? (
                'Sorteando…'
              ) : (
                <span key={round} className="animate-rise inline-block">
                  {place.visit_count === 0 ? 'Que tal algo novo hoje?' : 'Que tal voltar aqui?'}
                </span>
              )}
            </p>

            <div
              key={rolling ? 'rolling' : `done-${round}`}
              className={cn(
                'flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#efe9e3] bg-background',
                rolling ? 'scale-[0.97] shadow-none' : 'animate-settle shadow-[0_12px_32px_-12px_rgba(31,26,23,0.25)]',
              )}
            >
              <PlaceThumb place={place} className="h-55 w-full" iconSize={44} />
              <div className="flex flex-col gap-2 p-4.5">
                <span
                  className={cn(
                    'text-2xl leading-tight font-extrabold tracking-tight transition-[filter,opacity] duration-100',
                    rolling && 'opacity-70 blur-[1.5px]',
                  )}
                >
                  {place.name}
                </span>
                <span className="text-sm font-medium text-muted-foreground">{placeMeta(place)}</span>
                <div className={cn('flex flex-wrap gap-1.5 transition-opacity duration-150', rolling && 'opacity-0')}>
                  {place.kids_space && <Badge variant="kids">{place.kids_types[0] ?? 'Espaço kids'}</Badge>}
                  <VisitBadge place={place} />
                </div>
              </div>
            </div>

            <span className="text-center text-xs font-medium text-muted-foreground">
              {pool.length} {pool.length === 1 ? 'lugar possível' : 'lugares possíveis'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 px-5 pb-4">
            <Button asChild size="lg" className={cn('transition-opacity', rolling && 'pointer-events-none opacity-40')}>
              <Link to={`/lugar/${place.id}`} aria-disabled={rolling}>
                Bora nesse!
              </Link>
            </Button>
            <Button variant="outline" size="lg" disabled={pool.length < 2 || rolling} onClick={roll}>
              <Dices size={18} aria-hidden="true" className={cn(rolling && 'animate-spin')} /> Sortear outro
            </Button>
          </div>
        </>
      )}

      <BottomNav />
    </Screen>
  )
}
