import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { backend } from './data'
import type { Place, PlaceWithStats, Visit } from './types'
import { DEFAULT_FILTERS, withStats, type Filters } from './utils'

interface Store {
  places: PlaceWithStats[]
  visits: Visit[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  filters: Filters
  setFilters: (f: Filters) => void
  refresh: () => Promise<void>
  getPlace: (id: string | undefined) => PlaceWithStats | undefined
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rawPlaces, setRawPlaces] = useState<Place[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const refresh = useCallback(async () => {
    try {
      const [p, v] = await Promise.all([backend.listPlaces(), backend.listVisits()])
      setRawPlaces(p)
      setVisits(v)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const checkAdmin = () => void backend.isAdmin().then(setIsAdmin)
    checkAdmin()
    return backend.onAuthChange(checkAdmin)
  }, [refresh])

  const places = useMemo(() => withStats(rawPlaces, visits), [rawPlaces, visits])

  const value = useMemo<Store>(
    () => ({
      places,
      visits,
      loading,
      error,
      isAdmin,
      filters,
      setFilters,
      refresh,
      getPlace: (id) => places.find((p) => p.id === id),
    }),
    [places, visits, loading, error, isAdmin, filters, refresh],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fora do StoreProvider')
  return s
}
