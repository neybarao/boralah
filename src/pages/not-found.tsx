import { Link } from 'react-router'
import { Screen } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'

export default function NotFound({ message = 'Não achamos essa página.' }: { message?: string }) {
  const { loading } = useStore()
  if (loading) return <Screen className="px-8 pb-8 pt-[calc(2rem+env(safe-area-inset-top))] text-center text-sm text-muted-foreground">Carregando…</Screen>
  return (
    <Screen>
      <div className="flex flex-col items-start gap-4 px-8 pb-8 pt-[calc(2rem+env(safe-area-inset-top))]">
        <h1 className="text-xl font-extrabold">Ops</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </Screen>
  )
}
