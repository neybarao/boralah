import { MOCK_PLACES, MOCK_VISITS } from './mock'
import { PHOTO_BUCKET, supabase } from './supabase'
import type { Place, PlaceInput, Visit, VisitInput } from './types'

/**
 * Camada de dados. Todo acesso ao banco passa por aqui, então trocar
 * o Supabase por outro serviço no futuro mexe só neste arquivo.
 */
export interface Backend {
  listPlaces(): Promise<Place[]>
  listVisits(): Promise<Visit[]>
  savePlace(input: PlaceInput, id?: string): Promise<Place>
  deletePlace(id: string): Promise<void>
  addVisit(input: VisitInput): Promise<Visit>
  deleteVisit(id: string): Promise<void>
  uploadPhoto(file: Blob): Promise<string>
  isAdmin(): Promise<boolean>
  signIn(email: string): Promise<void>
  verifyCode(email: string, code: string): Promise<void>
  signOut(): Promise<void>
  onAuthChange(cb: () => void): () => void
}

// ---------- Supabase ----------

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

function supabaseBackend(): Backend {
  const db = supabase!
  return {
    async listPlaces() {
      return must(await db.from('places').select('*').order('name'))
    },
    async listVisits() {
      return must(await db.from('visits').select('*').order('visited_on', { ascending: false }))
    },
    async savePlace(input, id) {
      const query = id
        ? db.from('places').update(input).eq('id', id).select().single()
        : db.from('places').insert(input).select().single()
      return must(await query)
    },
    async deletePlace(id) {
      must(await db.from('places').delete().eq('id', id))
    },
    async addVisit(input) {
      return must(await db.from('visits').insert(input).select().single())
    },
    async deleteVisit(id) {
      must(await db.from('visits').delete().eq('id', id))
    },
    async uploadPhoto(file) {
      const path = `${crypto.randomUUID()}.webp`
      const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, file, {
        contentType: 'image/webp',
        cacheControl: '31536000',
      })
      if (error) throw new Error(error.message)
      return db.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
    },
    async isAdmin() {
      const { data } = await db.auth.getSession()
      const uid = data.session?.user.id
      if (!uid) return false
      const { data: row } = await db.from('admins').select('user_id').eq('user_id', uid).maybeSingle()
      return Boolean(row)
    },
    async signIn(email) {
      const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
      if (error) throw new Error(error.message)
    },
    async verifyCode(email, code) {
      const { error } = await db.auth.verifyOtp({ email, token: code, type: 'email' })
      if (error) throw new Error(error.message)
    },
    async signOut() {
      await db.auth.signOut()
    },
    onAuthChange(cb) {
      const { data } = db.auth.onAuthStateChange(() => cb())
      return () => data.subscription.unsubscribe()
    },
  }
}

// ---------- Demonstração (localStorage) ----------

const KEY = 'boralah-demo-v1'

interface DemoState {
  places: Place[]
  visits: Visit[]
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch {
    /* sem armazenamento: segue com os dados iniciais */
  }
  return { places: MOCK_PLACES, visits: MOCK_VISITS }
}

function save(state: DemoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignora: o app continua funcionando só na memória */
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

function demoBackend(): Backend {
  let state = load()
  const commit = (next: DemoState) => {
    state = next
    save(state)
  }
  return {
    async listPlaces() {
      return [...state.places].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    },
    async listVisits() {
      return [...state.visits].sort((a, b) => b.visited_on.localeCompare(a.visited_on))
    },
    async savePlace(input, id) {
      if (id) {
        const updated = state.places.map((p) => (p.id === id ? { ...p, ...input } : p))
        commit({ ...state, places: updated })
        return updated.find((p) => p.id === id)!
      }
      const place: Place = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      commit({ ...state, places: [...state.places, place] })
      return place
    },
    async deletePlace(id) {
      commit({
        places: state.places.filter((p) => p.id !== id),
        visits: state.visits.filter((v) => v.place_id !== id),
      })
    },
    async addVisit(input) {
      const visit: Visit = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      commit({ ...state, visits: [...state.visits, visit] })
      return visit
    },
    async deleteVisit(id) {
      commit({ ...state, visits: state.visits.filter((v) => v.id !== id) })
    },
    async uploadPhoto(file) {
      return blobToDataUrl(file)
    },
    async isAdmin() {
      return true
    },
    async signIn() {},
    async verifyCode() {},
    async signOut() {},
    onAuthChange() {
      return () => {}
    },
  }
}

export const backend: Backend = supabase ? supabaseBackend() : demoBackend()
