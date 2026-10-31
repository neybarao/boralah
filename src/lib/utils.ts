import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Place, PlaceWithStats, PriceLevel, Visit } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const money = (n: PriceLevel) => '$'.repeat(n)

export const formatRating = (n: number) => n.toFixed(1).replace('.', ',')

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function todayIso() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function daysSince(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const then = new Date(y, m - 1, d).getTime()
  return Math.floor((Date.now() - then) / 86_400_000)
}

/** "há 2 semanas", "há 3 meses" */
export function timeAgo(iso: string) {
  const days = daysSince(iso)
  if (days <= 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 14) return `há ${days} dias`
  if (days < 60) return `há ${Math.round(days / 7)} semanas`
  if (days < 365) return `há ${Math.round(days / 30)} meses`
  const years = Math.round(days / 365)
  return years === 1 ? 'há 1 ano' : `há ${years} anos`
}

export function withStats(places: Place[], visits: Visit[]): PlaceWithStats[] {
  return places.map((p) => {
    const mine = visits.filter((v) => v.place_id === p.id)
    const avg = mine.length ? mine.reduce((s, v) => s + v.rating, 0) / mine.length : null
    const last = mine.reduce<string | null>((acc, v) => (!acc || v.visited_on > acc ? v.visited_on : acc), null)
    return { ...p, visit_count: mine.length, avg_rating: avg, last_visit: last }
  })
}

export interface Filters {
  category: string
  kids: boolean
  never: boolean
  cheap: boolean
  query: string
}

export const DEFAULT_FILTERS: Filters = { category: 'Todos', kids: true, never: false, cheap: false, query: '' }

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function applyFilters(places: PlaceWithStats[], f: Filters) {
  const q = normalize(f.query.trim())
  return places.filter(
    (p) =>
      (f.category === 'Todos' || p.category === f.category) &&
      (!f.kids || p.kids_space) &&
      (!f.never || p.visit_count === 0) &&
      (!f.cheap || p.price_level <= 2) &&
      (!q || normalize(`${p.name} ${p.category} ${p.neighborhood ?? ''}`).includes(q)),
  )
}

/**
 * Reduz a foto no próprio celular antes de enviar (lado maior 1280 px, WebP),
 * para o app continuar leve e o armazenamento grátis render mais.
 */
export async function shrinkImage(file: File, maxSide = 1280, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Não deu pra processar a foto'))), 'image/webp', quality),
  )
}
