import type React from 'react'
import { useEffect, useRef } from 'react'
import { AtSign, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { BackButton, Screen, StickyAction } from '@/components/layout'
import { OpenBadge, placeMeta, VisitBadge } from '@/components/place-row'
import { PlaceThumb } from '@/components/place-thumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { backend } from '@/lib/data'
import { gsap, reducedMotion } from '@/lib/motion'
import { scroller } from '@/lib/scroller'
import { useStore } from '@/lib/store'
import { formatDay } from '@/lib/hours'
import { KIDS_MONITOR, KIDS_SIZES, WEEKDAYS, type BabyLiked, type WouldReturn, type YesNoUnknown } from '@/lib/types'
import { cn, formatDate, formatRating } from '@/lib/utils'
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

/**
 * Foto de capa com profundidade: ao rolar, ela sobe mais devagar que o texto;
 * ao puxar além do topo (o quique do iOS), ela cresce em vez de abrir um vão.
 */
function useHeroParallax(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const setY = gsap.quickSetter(el, 'y', 'px')
    const setScale = gsap.quickSetter(el, 'scale')
    let frame = 0
    const update = () => {
      frame = 0
      const y = scroller().scrollTop
      if (y < 0) {
        setY(y)
        setScale(1 + -y / el.offsetHeight)
      } else {
        setY(y * 0.4)
        setScale(1)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    gsap.set(el, { transformOrigin: '50% 100%' })
    const box = scroller()
    box.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      box.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ready])
  return ref
}

export default function PlacePage() {
  const { id } = useParams()
  const { getPlace, visits, isAdmin, refresh } = useStore()
  const place = getPlace(id)
  const heroRef = useHeroParallax(!!place)
  if (!place) return <NotFound />

  const mine = visits.filter((v) => v.place_id === place.id)
  const handle = place.instagram?.replace(/^@/, '').trim()
  const size = KIDS_SIZES.find((s) => s.value === place.kids_size)
  const today = new Date().getDay()

  return (
    <Screen bleed className="pb-32">
      {/* Corta só embaixo e dos lados: no quique do topo a foto pode crescer para cima */}
      <div className="relative [clip-path:inset(-100vh_0_0_0)]">
        <div ref={heroRef} className="will-change-transform">
        {place.photos.length > 1 ? (
          <div className="no-scrollbar animate-hero flex h-[calc(19.5rem+env(safe-area-inset-top))] snap-x snap-mandatory overflow-x-auto">
            {place.photos.map((src) => (
              <img key={src} src={src} alt="" className="h-[calc(19.5rem+env(safe-area-inset-top))] w-full shrink-0 snap-center object-cover" />
            ))}
          </div>
        ) : (
          <PlaceThumb place={place} className="animate-hero h-[calc(19.5rem+env(safe-area-inset-top))] w-full" iconSize={48} />
        )}
        </div>
        {/* Sombra suave no topo: deixa o relógio e a bateria legíveis sobre qualquer foto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[calc(env(safe-area-inset-top)+4.5rem)] bg-gradient-to-b from-black/45 to-transparent"
        />
        <div className="absolute inset-x-5 top-[calc(env(safe-area-inset-top)+1.75rem)] flex justify-between">
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
          <OpenBadge place={place} long />
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

      <section className="animate-rise mx-5 mt-2 flex flex-col gap-3.5 rounded-xl bg-kids-surface px-4.5 py-4 [animation-delay:160ms]">
        <h2 className="text-[15px] font-extrabold text-kids">Espaço kids</h2>
        {place.kids_types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {place.kids_types.map((k, i) => (
              <Badge
                key={k}
                variant="kids"
                className="animate-pop stagger bg-background"
                style={{ '--i': i } as React.CSSProperties}
              >
                {k}
              </Badge>
            ))}
          </div>
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] leading-snug">
          {[
            ['Bom pra idade', place.kids_age || 'Não sei'],
            ['Tamanho', size?.label ?? 'Não sei'],
            ['Monitora', KIDS_MONITOR[place.kids_monitor ?? 'nao_sei']],
            ['Cadeirão', YNU[place.high_chair]],
            ['Trocador', YNU[place.changing_table]],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="font-semibold text-kids-label">{label}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="animate-rise mx-5 mt-3 flex flex-col gap-2.5 rounded-xl border-[1.5px] border-line px-4.5 py-4 [animation-delay:200ms]">
        <h2 className="text-[15px] font-extrabold">Horário</h2>
        {place.opening_hours ? (
          <ul className="flex flex-col gap-1 text-[13px]">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <li
                key={d}
                className={cn(
                  'flex justify-between rounded-md px-2 py-1 transition-colors',
                  d === today ? 'bg-muted font-bold' : 'font-medium text-text-soft',
                )}
              >
                <span>
                  {WEEKDAYS[d]}
                  {d === today && ' · hoje'}
                </span>
                <span className="tabular-nums">{formatDay(place.opening_hours![d])}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] font-medium text-muted-foreground">Horário ainda não informado.</p>
        )}
      </section>

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
