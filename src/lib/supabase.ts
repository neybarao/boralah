import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/**
 * Cliente do Supabase. Fica null quando as variáveis de ambiente não existem,
 * e aí o app roda em modo demonstração, com dados fictícios salvos no navegador.
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export const isDemo = supabase === null

export const PHOTO_BUCKET = 'fotos'
