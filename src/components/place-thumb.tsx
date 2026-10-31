import { UtensilsCrossed } from 'lucide-react'
import type { Place } from '@/lib/types'
import { cn } from '@/lib/utils'

const TINTS = ['#F6E3C8', '#F3D6CF', '#E9DCCF', '#F7E1C1', '#DCE8E4', '#F4E8C4', '#E6DDEE']

function tintFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length]
}

/** Primeira foto do lugar, ou um bloco colorido quando ainda não tem foto. */
export function PlaceThumb({ place, className, iconSize = 28 }: { place: Place; className?: string; iconSize?: number }) {
  const photo = place.photos[0]
  if (photo) {
    return <img src={photo} alt="" loading="lazy" decoding="async" className={cn('shrink-0 object-cover', className)} />
  }
  return (
    <div
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center', className)}
      style={{ background: tintFor(place.id) }}
    >
      <UtensilsCrossed size={iconSize} strokeWidth={1.6} className="text-foreground/40" />
    </div>
  )
}
