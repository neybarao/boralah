import type React from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import type { PlaceWithStats } from '@/lib/types'
import { openStatus } from '@/lib/hours'
import { formatRating, money } from '@/lib/utils'
import { PlaceThumb } from './place-thumb'

export function VisitBadge({ place }: { place: PlaceWithStats }) {
  if (place.visit_count === 0) return <Badge variant="new">Nunca fomos</Badge>
  return (
    <Badge>
      Nota {formatRating(place.avg_rating ?? 0)} · {place.visit_count} {place.visit_count === 1 ? 'visita' : 'visitas'}
    </Badge>
  )
}

/** "Aberto agora" ou "Fechado", com um ponto que pulsa quando está aberto */
export function OpenBadge({ place, long = false }: { place: PlaceWithStats; long?: boolean }) {
  const s = openStatus(place.opening_hours)
  if (!s) return null
  return (
    <Badge variant={s.open ? 'kids' : 'neutral'} className="gap-1.5">
      <span className="relative flex size-1.5" aria-hidden="true">
        {s.open && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />}
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      {long ? s.label : s.open ? 'Aberto' : 'Fechado'}
    </Badge>
  )
}

export function placeMeta(p: PlaceWithStats) {
  return [p.category, money(p.price_level), p.neighborhood].filter(Boolean).join(' · ')
}

export function PlaceRow({ place, index = 0 }: { place: PlaceWithStats; index?: number }) {
  return (
    <Link
      to={`/lugar/${place.id}`}
      style={{ '--i': index } as React.CSSProperties}
      className="group animate-rise stagger flex gap-3.5 border-b border-line py-3 outline-none focus-visible:bg-muted"
    >
      <PlaceThumb
        place={place}
        className="size-21 rounded-lg transition-transform duration-200 ease-out group-active:scale-95"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="truncate text-base font-bold leading-tight">{place.name}</span>
        <span className="truncate text-[13px] font-medium text-muted-foreground">{placeMeta(place)}</span>
        <div className="mt-0.5 flex flex-wrap gap-1.5">
          <OpenBadge place={place} />
          {place.kids_types[0] && <Badge variant="kids">{place.kids_types[0]}</Badge>}
          <VisitBadge place={place} />
        </div>
      </div>
    </Link>
  )
}
