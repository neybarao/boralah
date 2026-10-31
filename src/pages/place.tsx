import { AtSign, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { BackButton, Screen, StickyAction } from '@/components/layout'
import { placeMeta, VisitBadge } from '@/components/place-row'
import { PlaceThumb } from '@/components/place-thumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { backend } from '@/lib/data'
import { useStore } from '@/lib/store'
import type { BabyLiked, WouldReturn, YesNoUnknown } from '@/lib/types'
import { formatDate, formatRating } from '@/lib/utils'
import NotFound from './not-found'

const YNU: Record<YesNoUnknown, string> = { sim: 'Sim', nao: 'Não', nao_sei: 'Não sei' }
const BABY: Record<BabyLiked, string> = { amou: 'Bebê amou', mais_ou_menos: 'Bebê achou mais ou menos', nao_curtiu: 'Bebê não curtiu' }
const AGAIN: Record<WouldReturn, string> = { sim: 'Voltaríamos', talvez: 'Talvez voltemos', nao: 'Não voltaríamos' }

function Stars({ value }: { value: number }) {
  return (
    <span className="text-[13px] font-bold text-text-soft" aria-label={`Nota ${formatRating(value)} de 5`}>
      <span aria-hidden="true" className="text-star">
        {'★'.repeat(Math.floor(value))}
        {value % 1 ? '½' : ''}
      </span>{' '}
      {formatRating(value)}
    </span>
  )
}

export default function PlacePage() {
  const { id } = useParams()
  const { getPlace, visits, isAdmin, refresh } = useStore()
  const place = getPlace(id)
  if (!place) return <NotFound />

  const mine = visits.filter((v) => v.place_id === place.id)
  const handle = place.instagram?.replace(/^@/, '').trim()

  return (
    <Screen className="pb-32">
      <div className="relative overflow-hidden">
        {place.photos.length > 1 ? (
          <div className="no-scrollbar animate-hero flex h-65 snap-x snap-mandatory overflow-x-auto">
            {place.photos.map((src) => (
              <img key={src} src={src} alt="" className="h-65 w-full shrink-0 snap-center object-cover" />
            ))}
          </div>
        ) : (
          <PlaceThumb place={place} className="animate-hero h-65 w-full" iconSize={48} />
        )}
        <div className="absolute inset-x-5 top-5 flex justify-between">
          <BackButton to="/" />
          {isAdmin && (
            <Button asChild variant="muted" size="icon" aria-label="Editar lugar" className="bg-background hover:bg-background/90">
              <Link to={`/lugar/${place.id}/editar`}>
                <Pencil size={18} />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="animate-rise flex flex-col gap-2 px-5 pt-5 [animation-delay:80ms]">
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">{place.name}</h1>
        <span className="text-sm font-medium text-muted-foreground">{placeMeta(place)}</span>
        <div className="mt-0.5 flex flex-wrap gap-1.5">
          {place.kids_types.map((k) => (
            <Badge key={k} variant="kids">
              {k}
            </Badge>
          ))}
          <VisitBadge place={place} />
        </div>
      </div>

      {(place.maps_url || handle) && (
        <div className="grid grid-cols-2 gap-2.5 p-5">
          {place.maps_url && (
            <Button asChild variant="muted" className="rounded-lg">
              <a href={place.maps_url} target="_blank" rel="noreferrer">
                <MapPin size={18} aria-hidden="true" /> Abrir no mapa
              </a>
            </Button>
          )}
          {handle && (
            <Button asChild variant="muted" className="rounded-lg">
              <a href={`https://instagram.com/${encodeURIComponent(handle)}`} target="_blank" rel="noreferrer">
                <AtSign size={18} aria-hidden="true" /> Instagram
              </a>
            </Button>
          )}
        </div>
      )}

      {place.kids_space && (
        <section className="animate-rise mx-5 mt-2 flex flex-col gap-2.5 rounded-xl bg-kids-surface px-4.5 py-4 [animation-delay:160ms]">
          <h2 className="text-[15px] font-extrabold text-kids">Para o bebê</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px] leading-snug">
            <div className="flex flex-col gap-0.5">
              <dt className="font-semibold text-kids-label">Espaço</dt>
              <dd className="font-bold">{place.kids_types.join(', ') || 'Tem'}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="font-semibold text-kids-label">Bom pra idade</dt>
              <dd className="font-bold">{place.kids_age || 'Não sei'}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="font-semibold text-kids-label">Cadeirão</dt>
              <dd className="font-bold">{YNU[place.high_chair]}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="font-semibold text-kids-label">Trocador</dt>
              <dd className="font-bold">{YNU[place.changing_table]}</dd>
            </div>
          </dl>
        </section>
      )}

      {place.notes && <p className="px-5 pt-5 text-sm leading-relaxed text-text-soft">{place.notes}</p>}

      <section className="animate-rise flex flex-col px-5 pt-6 [animation-delay:220ms]">
        <h2 className="mb-1.5 text-lg font-extrabold tracking-tight">Nossas visitas</h2>
        {mine.length === 0 && <p className="py-3 text-sm text-muted-foreground">Ainda não fomos. Bora?</p>}
        {mine.map((v) => (
          <article key={v.id} className="flex flex-col gap-1.5 border-b border-line py-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold">{formatDate(v.visited_on)}</span>
              <Stars value={v.rating} />
            </div>
            {v.notes && <p className="text-sm leading-snug text-text-soft">{v.notes}</p>}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                {[
                  v.baby_liked && BABY[v.baby_liked],
                  v.would_return && AGAIN[v.would_return],
                  v.spent != null && `R$ ${v.spent.toFixed(2).replace('.', ',')}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  aria-label={`Apagar visita de ${formatDate(v.visited_on)}`}
                  className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  onClick={async () => {
                    if (!confirm('Apagar esta visita?')) return
                    await backend.deleteVisit(v.id)
                    await refresh()
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {isAdmin && (
        <StickyAction>
          <Button asChild size="lg" className="w-full">
            <Link to={`/lugar/${place.id}/visita`}>
              <Plus size={18} aria-hidden="true" /> Registrar visita
            </Link>
          </Button>
        </StickyAction>
      )}
    </Screen>
  )
}
