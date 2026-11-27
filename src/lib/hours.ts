import { WEEKDAYS, type DayHours, type OpeningHours } from './types'

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** "11:00" → "11h", "18:30" → "18h30" */
export const shortTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':')
  return `${Number(h)}h${m && m !== '00' ? m : ''}`
}

export const formatDay = (d: DayHours | null) => (d ? `${shortTime(d.open)} às ${shortTime(d.close)}` : 'Fechado')

const overnight = (d: DayHours) => toMin(d.close) <= toMin(d.open)

export interface OpenStatus {
  open: boolean
  /** Ex.: "Aberto · fecha às 23h", "Fechado · abre amanhã às 11h" */
  label: string
}

/** Situação agora. null quando o horário não foi informado. */
export function openStatus(hours: OpeningHours | null | undefined, now = new Date()): OpenStatus | null {
  if (!hours || hours.length !== 7) return null
  const day = now.getDay()
  const t = now.getHours() * 60 + now.getMinutes()

  const today = hours[day]
  const yesterday = hours[(day + 6) % 7]

  // Ainda aberto pela noite de ontem (ex.: ontem 18h às 2h, agora 1h)
  if (yesterday && overnight(yesterday) && t < toMin(yesterday.close)) {
    return { open: true, label: `Aberto · fecha às ${shortTime(yesterday.close)}` }
  }
  if (today) {
    const o = toMin(today.open)
    const c = toMin(today.close)
    if (overnight(today) ? t >= o : t >= o && t < c) {
      return { open: true, label: `Aberto · fecha às ${shortTime(today.close)}` }
    }
    if (t < o) return { open: false, label: `Fechado · abre às ${shortTime(today.open)}` }
  }
  for (let i = 1; i <= 7; i++) {
    const next = hours[(day + i) % 7]
    if (!next) continue
    const when = i === 1 ? 'amanhã' : WEEKDAYS[(day + i) % 7].toLowerCase()
    return { open: false, label: `Fechado · abre ${when} às ${shortTime(next.open)}` }
  }
  return { open: false, label: 'Fechado' }
}

export const isOpenNow = (hours: OpeningHours | null | undefined, now = new Date()) => openStatus(hours, now)?.open ?? false
