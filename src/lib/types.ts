export type PriceLevel = 1 | 2 | 3
export type YesNoUnknown = 'sim' | 'nao' | 'nao_sei'
export type BabyLiked = 'amou' | 'mais_ou_menos' | 'nao_curtiu'
export type WouldReturn = 'sim' | 'talvez' | 'nao'

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
export const KIDS_TYPES = ['Parquinho', 'Brinquedoteca', 'Monitores', 'Cantinho kids'] as const
