import { Star } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BackButton, Screen, StickyAction, TopBar } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { backend } from '@/lib/data'
import { useStore } from '@/lib/store'
import type { BabyLiked, WouldReturn } from '@/lib/types'
import { cn, todayIso } from '@/lib/utils'
import NotFound from './not-found'

const BABY: [BabyLiked, string][] = [['amou', 'Amou'], ['mais_ou_menos', 'Mais ou menos'], ['nao_curtiu', 'Não curtiu']]
const AGAIN: [WouldReturn, string][] = [['sim', 'Sim'], ['talvez', 'Talvez'], ['nao', 'Não']]

export default function VisitForm() {
  const { id } = useParams()
  const { getPlace, refresh } = useStore()
  const navigate = useNavigate()
  const place = getPlace(id)

  const [date, setDate] = useState(todayIso())
  const [rating, setRating] = useState(0)
  const [baby, setBaby] = useState<BabyLiked | null>(null)
  const [again, setAgain] = useState<WouldReturn | null>(null)
  const [spent, setSpent] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!place) return <NotFound />

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!rating) return setError('Dê uma nota de 1 a 5.')
    setSaving(true)
    setError(null)
    try {
      const value = spent.trim() ? Number(spent.replace(/[^\d,.]/g, '').replace(',', '.')) : null
      await backend.addVisit({
        place_id: place!.id,
        visited_on: date,
        rating,
        baby_liked: baby,
        would_return: again,
        spent: value != null && Number.isFinite(value) ? value : null,
        notes: notes.trim() || null,
      })
      await refresh()
      navigate(`/lugar/${place!.id}`, { replace: true, state: { back: true, toast: 'Visita salva' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu pra salvar')
      setSaving(false)
    }
  }

  return (
    <Screen className="pb-32">
      <TopBar title="Registrar visita" subtitle={place.name} back={<BackButton close />} />
      <form id="visit" onSubmit={submit} className="flex flex-col gap-6 px-5 pt-4">
        <Label>
          Quando fomos
          <Input type="date" required value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
        </Label>

        <fieldset className="flex flex-col">
          <legend className="mb-2.5 text-sm font-bold">Nota geral</legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={n === 1 ? '1 estrela' : `${n} estrelas`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                className="flex size-13 cursor-pointer items-center justify-center rounded-lg bg-muted outline-none transition-transform duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Star
                  key={n <= rating ? `on-${rating}` : 'off'}
                  size={28}
                  strokeWidth={1.6}
                  style={{ animationDelay: `${(n - 1) * 45}ms` }}
                  className={cn(
                    'transition-colors duration-200',
                    n <= rating ? 'animate-pop fill-star text-[#b57d0a]' : 'text-[#8a817a]',
                  )}
                />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2.5 text-sm font-bold">O bebê curtiu o espaço kids?</legend>
          <div className="flex flex-wrap gap-2">
            {BABY.map(([value, label]) => (
              <Chip key={value} active={baby === value} onClick={() => setBaby(baby === value ? null : value)}>
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2.5 text-sm font-bold">Voltaríamos?</legend>
          <div className="flex flex-wrap gap-2">
            {AGAIN.map(([value, label]) => (
              <Chip key={value} active={again === value} onClick={() => setAgain(again === value ? null : value)}>
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <Label>
          <span>
            Quanto gastamos <span className="font-medium text-muted-foreground">(opcional)</span>
          </span>
          <Input inputMode="decimal" placeholder="R$ 0,00" value={spent} onChange={(e) => setSpent(e.target.value)} />
        </Label>

        <Label>
          Anotações
          <Textarea
            rows={4}
            placeholder="O que pedimos, o que valeu, dicas pra próxima vez"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Label>

        {error && (
          <p role="alert" className="text-sm font-semibold text-primary">
            {error}
          </p>
        )}
      </form>

      <StickyAction>
        <Button type="submit" form="visit" size="lg" className="w-full" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar visita'}
        </Button>
      </StickyAction>
    </Screen>
  )
}
