import { Link } from 'react-router'
import { BottomNav, Screen } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { backend } from '@/lib/data'
import { isDemo } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { formatDate, formatRating } from '@/lib/utils'

export default function Visits() {
  const { visits, getPlace, isAdmin } = useStore()

  return (
    <Screen className="pb-28">
      <header className="px-5 pt-5 pb-2">
        <h1 className="text-[22px] font-extrabold tracking-tight">Nossas visitas</h1>
        <p className="text-sm font-medium text-muted-foreground">
          {visits.length === 1 ? '1 visita registrada' : `${visits.length} visitas registradas`}
        </p>
      </header>

      <div className="flex flex-col px-5">
        {visits.length === 0 && (
          <p className="py-6 text-sm text-muted-foreground">Nenhuma visita ainda. Escolha um lugar e registre a primeira.</p>
        )}
        {visits.map((v) => {
          const place = getPlace(v.place_id)
          if (!place) return null
          return (
            <Link key={v.id} to={`/lugar/${place.id}`} className="flex flex-col gap-1 border-b border-line py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[15px] font-bold">{place.name}</span>
                <span className="shrink-0 text-[13px] font-bold">
                  <span aria-hidden="true" className="text-star">★</span> {formatRating(v.rating)}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{formatDate(v.visited_on)}</span>
              {v.notes && <p className="line-clamp-2 text-sm leading-snug text-text-soft">{v.notes}</p>}
            </Link>
          )
        })}
      </div>

      {!isDemo && (
        <div className="px-5 pt-8">
          {isAdmin ? (
            <Button variant="ghost" size="sm" onClick={() => backend.signOut()}>
              Sair da conta de edição
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/entrar">Entrar para editar</Link>
            </Button>
          )}
        </div>
      )}

      <BottomNav />
    </Screen>
  )
}
