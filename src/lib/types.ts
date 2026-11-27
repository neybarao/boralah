export type PriceLevel = 1 | 2 | 3
export type YesNoUnknown = 'sim' | 'nao' | 'nao_sei'
export type BabyLiked = 'amou' | 'mais_ou_menos' | 'nao_curtiu'
export type WouldReturn = 'sim' | 'talvez' | 'nao'
export type KidsSize = 'pequeno' | 'medio' | 'grande'
export type KidsMonitor = 'sim' | 'alguns_horarios' | 'nao' | 'nao_sei'
/** Horário de um dia, "HH:MM". Se close <= open, fecha depois da meia-noite. */
export interface DayHours {
  open: string
  close: string
}
/** 7 itens, domingo (0) a sábado (6); null = fechado nesse dia */
export type OpeningHours = (DayHours | null)[]

export interface Place {
  id: string
  name: string
  category: string
  price_level: PriceLevel
  neighborhood: string | null
  maps_url: string | null
  instagram: string | null
  kids_space: boolean
  kids_types: string[]
  kids_age: string | null
  kids_size: KidsSize | null
  kids_monitor: KidsMonitor
  /** null = horário não informado */
  opening_hours: OpeningHours | null
  high_chair: YesNoUnknown
  changing_table: YesNoUnknown
  photos: string[]
  notes: string | null
  created_at: string
}

export type PlaceInput = Omit<Place, 'id' | 'created_at'>

export interface Visit {
  id: string
  place_id: string
  visited_on: string // AAAA-MM-DD
  rating: number // 1 a 5
  baby_liked: BabyLiked | null
  would_return: WouldReturn | null
  spent: number | null
  notes: string | null
  created_at: string
}

export type VisitInput = Omit<Visit, 'id' | 'created_at'>

/** Lugar com os números calculados a partir das visitas */
export interface PlaceWithStats extends Place {
  visit_count: number
  avg_rating: number | null
  last_visit: string | null
}

export const CATEGORIES = ['Regional', 'Lanches', 'Pizza', 'Japonesa', 'Italiana', 'Carnes', 'Outro'] as const
export const KIDS_TYPES = ['Parquinho', 'Brinquedoteca', 'Cantinho kids', 'Pula-pula', 'Piscina de bolinhas'] as const

export const KIDS_SIZES: { value: KidsSize; label: string; hint: string }[] = [
  { value: 'pequeno', label: 'Pequeno', hint: 'Cantinho com alguns brinquedos' },
  { value: 'medio', label: 'Médio', hint: 'Sala ou área com vários brinquedos' },
  { value: 'grande', label: 'Grande', hint: 'Playground ou brinquedão de vários andares' },
]

export const KIDS_MONITOR: Record<KidsMonitor, string> = {
  sim: 'Tem monitora',
  alguns_horarios: 'Monitora em alguns horários',
  nao: 'Sem monitora',
  nao_sei: 'Não sei',
}

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
