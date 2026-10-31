import type { Place, Visit } from './types'

// Dados fictícios do protótipo, usados só no modo demonstração.
const now = '2026-10-30T20:00:00Z'

const base = {
  maps_url: null,
  instagram: null,
  photos: [],
  notes: null,
  created_at: now,
} satisfies Partial<Place>

export const MOCK_PLACES: Place[] = [
  { ...base, id: 'demo-soba', name: 'Sobá do Jardim', category: 'Regional', price_level: 1, neighborhood: 'Jardim dos Estados', kids_space: true, kids_types: ['Parquinho'], kids_age: '1 a 3 anos', high_chair: 'sim', changing_table: 'nao_sei' },
  { ...base, id: 'demo-nonna', name: 'Cantina Nonna Tereza', category: 'Italiana', price_level: 2, neighborhood: 'Centro', kids_space: true, kids_types: ['Brinquedoteca'], kids_age: null, high_chair: 'sim', changing_table: 'sim' },
  { ...base, id: 'demo-grelha', name: 'Grelha Pantanal', category: 'Carnes', price_level: 3, neighborhood: 'Carandá Bosque', kids_space: true, kids_types: ['Monitores', 'Brinquedoteca'], kids_age: null, high_chair: 'sim', changing_table: 'sim' },
  { ...base, id: 'demo-forno', name: 'Forno Vivo Pizzaria', category: 'Pizza', price_level: 2, neighborhood: 'Tiradentes', kids_space: true, kids_types: ['Parquinho'], kids_age: null, high_chair: 'nao_sei', changing_table: 'nao_sei' },
  { ...base, id: 'demo-hashi', name: 'Hashi Bistrô', category: 'Japonesa', price_level: 3, neighborhood: 'Chácara Cachoeira', kids_space: false, kids_types: [], kids_age: null, high_chair: 'sim', changing_table: 'nao' },
  { ...base, id: 'demo-ipe', name: 'Lanchonete Ipê', category: 'Lanches', price_level: 1, neighborhood: 'Santa Fé', kids_space: true, kids_types: ['Cantinho kids'], kids_age: null, high_chair: 'sim', changing_table: 'nao' },
  { ...base, id: 'demo-guavira', name: 'Casa Guavira', category: 'Regional', price_level: 2, neighborhood: 'Vilas Boas', kids_space: true, kids_types: ['Brinquedoteca'], kids_age: null, high_chair: 'sim', changing_table: 'sim' },
]

const v = (id: string, place_id: string, visited_on: string, rating: number, notes: string | null = null): Visit => ({
  id, place_id, visited_on, rating, notes, baby_liked: 'amou', would_return: 'sim', spent: null, created_at: now,
})

export const MOCK_VISITS: Visit[] = [
  v('v1', 'demo-soba', '2026-08-28', 5, 'Sobá caprichado e o parquinho cheio de crianças. Chegar antes das 19h.'),
  v('v2', 'demo-soba', '2026-06-12', 4, 'Demorou um pouco pra sair, mas valeu.'),
  v('v3', 'demo-soba', '2026-04-03', 4.5, 'Primeira vez com o bebê, cadeirão limpo.'),
  v('v4', 'demo-grelha', '2026-05-30', 4),
  v('v5', 'demo-hashi', '2026-07-25', 4),
  v('v6', 'demo-ipe', '2026-10-16', 3.5),
  v('v7', 'demo-ipe', '2026-09-20', 3.5),
]
