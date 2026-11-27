import { Camera, Trash2, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { HoursEditor, DEFAULT_WEEK } from '@/components/hours-editor'
import { BackButton, Screen, StickyAction, TopBar } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { backend } from '@/lib/data'
import { useStore } from '@/lib/store'
import {
  CATEGORIES,
  KIDS_MONITOR,
  KIDS_SIZES,
  KIDS_TYPES,
  type KidsMonitor,
  type PlaceInput,
  type PriceLevel,
  type YesNoUnknown,
} from '@/lib/types'
import { shrinkImage } from '@/lib/utils'
import NotFound from './not-found'

const EMPTY: PlaceInput = {
  name: '',
  category: 'Regional',
  price_level: 2,
  neighborhood: null,
  maps_url: null,
  instagram: null,
  kids_space: true,
  kids_types: [],
  kids_age: null,
  kids_size: null,
  kids_monitor: 'nao_sei',
  opening_hours: DEFAULT_WEEK,
  high_chair: 'nao_sei',
  changing_table: 'nao_sei',
  photos: [],
  notes: null,
}

export default function PlaceForm() {
  const { id } = useParams()
  const { getPlace, refresh, isAdmin } = useStore()
  const navigate = useNavigate()
  const existing = getPlace(id)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<PlaceInput>(() => {
    if (!existing) return EMPTY
    const { id: _id, created_at: _c, visit_count: _v, avg_rating: _a, last_visit: _l, ...rest } = existing
    // Lugares antigos podem não ter os campos novos
    return {
      ...rest,
      kids_space: true,
      kids_size: rest.kids_size ?? null,
      kids_monitor: rest.kids_monitor ?? 'nao_sei',
      opening_hours: rest.opening_hours ?? null,
    }
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (id && !existing) return <NotFound />
  if (!isAdmin) return <NotFound message="Só quem administra o app pode cadastrar lugares." />

  const set = <K extends keyof PlaceInput>(key: K, value: PlaceInput[K]) => setForm((f) => ({ ...f, [key]: value }))
  const text = (v: string) => (v.trim() ? v : null)

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        urls.push(await backend.uploadPhoto(await shrinkImage(file)))
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu pra enviar a foto')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    // O espaço kids é o coração do app: tipo, idade e tamanho são obrigatórios
    const missing = [
      !form.kids_types.length && 'o tipo de espaço kids',
      !form.kids_age && 'a idade',
      !form.kids_size && 'o tamanho do espaço',
    ].filter(Boolean)
    if (missing.length) {
      setError(`Falta preencher ${missing.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`)
      document.getElementById('kids')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved = await backend.savePlace({ ...form, name: form.name.trim() }, existing?.id)
      await refresh()
      navigate(`/lugar/${saved.id}`, { replace: true, state: { toast: existing ? 'Lugar atualizado' : 'Lugar cadastrado' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu pra salvar')
      setSaving(false)
    }
  }

  async function remove() {
    if (!existing || !confirm(`Apagar "${existing.name}" e todas as visitas dele?`)) return
    await backend.deletePlace(existing.id)
    await refresh()
    navigate('/', { replace: true, state: { back: true, toast: 'Lugar apagado' } })
  }

  return (
    <Screen className="pb-32">
      <TopBar title={existing ? 'Editar lugar' : 'Novo lugar'} back={<BackButton close />} />

      <form id="place" onSubmit={submit} className="flex flex-col gap-5.5 px-5 pt-4">
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
          {form.photos.map((src) => (
            <div key={src} className="animate-pop relative size-24 shrink-0">
              <img src={src} alt="" className="size-24 rounded-xl object-cover" />
              <button
                type="button"
                aria-label="Remover foto"
                onClick={() => set('photos', form.photos.filter((p) => p !== src))}
                className="absolute -top-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-foreground text-background"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <label className="flex size-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-control-off bg-dashed-surface text-xs font-bold text-text-soft">
            <Camera size={24} strokeWidth={1.8} aria-hidden="true" />
            {uploading ? 'Enviando…' : 'Adicionar fotos'}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => addPhotos(e.target.files)}
            />
          </label>
        </div>

        <Label>
          Nome
          <Input required value={form.name} placeholder="Ex.: Cantina da esquina" onChange={(e) => set('name', e.target.value)} />
        </Label>

        <Label>
          Tipo de comida
          <NativeSelect value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
        </Label>

        <fieldset>
          <legend className="mb-2.5 text-sm font-bold">Faixa de preço</legend>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as PriceLevel[]).map((n) => (
              <Chip key={n} active={form.price_level === n} onClick={() => set('price_level', n)} className="justify-center">
                {'$'.repeat(n)}
              </Chip>
            ))}
          </div>
        </fieldset>

        <Label>
          Link do Google Maps
          <Input
            type="url"
            placeholder="Cole o link do local"
            value={form.maps_url ?? ''}
            onChange={(e) => set('maps_url', text(e.target.value))}
          />
        </Label>

        <section id="kids" className="flex flex-col gap-4.5 rounded-xl bg-kids-surface p-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-extrabold text-kids">Espaço kids</h2>
            <span className="text-xs font-medium text-kids-label">O que as famílias precisam saber antes de sair de casa</span>
          </div>

          <fieldset>
            <legend className="mb-2 text-[13px] font-bold text-kids-label">Que tipo</legend>
            <div className="flex flex-wrap gap-2">
              {KIDS_TYPES.map((k) => {
                const on = form.kids_types.includes(k)
                return (
                  <Chip
                    key={k}
                    active={on}
                    onClick={() => set('kids_types', on ? form.kids_types.filter((x) => x !== k) : [...form.kids_types, k])}
                  >
                    {k}
                  </Chip>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[13px] font-bold text-kids-label">Tamanho do espaço</legend>
            <div className="grid grid-cols-3 gap-2">
              {KIDS_SIZES.map((s) => (
                <Chip
                  key={s.value}
                  active={form.kids_size === s.value}
                  onClick={() => set('kids_size', s.value)}
                  className="justify-center"
                >
                  {s.label}
                </Chip>
              ))}
            </div>
            <p key={form.kids_size ?? 'none'} className="animate-rise mt-1.5 min-h-4 text-xs font-medium text-kids-label">
              {KIDS_SIZES.find((s) => s.value === form.kids_size)?.hint ?? 'Escolha o que mais se parece'}
            </p>
          </fieldset>

          <Label className="text-[13px] text-kids-label">
            Bom pra idade
            <Input
              placeholder="Ex.: 1 a 5 anos"
              value={form.kids_age ?? ''}
              onChange={(e) => set('kids_age', text(e.target.value))}
              className="h-11 border-kids-border"
            />
          </Label>

          <Label className="gap-1.5 text-[13px] text-kids-label">
            Monitora
            <NativeSelect
              value={form.kids_monitor}
              onChange={(e) => set('kids_monitor', e.target.value as KidsMonitor)}
              className="h-11 border-kids-border"
            >
              {(Object.keys(KIDS_MONITOR) as KidsMonitor[]).map((k) => (
                <option key={k} value={k}>
                  {KIDS_MONITOR[k]}
                </option>
              ))}
            </NativeSelect>
          </Label>

          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                ['high_chair', 'Cadeirão'],
                ['changing_table', 'Trocador'],
              ] as const
            ).map(([key, label]) => (
              <Label key={key} className="gap-1.5 text-[13px] text-kids-label">
                {label}
                <NativeSelect
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value as YesNoUnknown)}
                  className="h-11 border-kids-border"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                  <option value="nao_sei">Não sei</option>
                </NativeSelect>
              </Label>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span id="hours-label" className="text-sm font-bold">
              Horário de funcionamento
            </span>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              Não sei
              <Switch
                aria-label="Não sei o horário"
                checked={!form.opening_hours}
                onCheckedChange={(unknown) => set('opening_hours', unknown ? null : DEFAULT_WEEK)}
              />
            </label>
          </div>
          {form.opening_hours && <HoursEditor value={form.opening_hours} onChange={(v) => set('opening_hours', v)} />}
        </section>

        <Label>
          <span>
            Observações <span className="font-medium text-muted-foreground">(opcional)</span>
          </span>
          <Textarea rows={3} value={form.notes ?? ''} onChange={(e) => set('notes', text(e.target.value))} />
        </Label>

        {error && (
          <p role="alert" className="text-sm font-semibold text-primary">
            {error}
          </p>
        )}

        {existing && (
          <Button type="button" variant="ghost" className="self-start text-primary" onClick={remove}>
            <Trash2 size={16} aria-hidden="true" /> Apagar lugar
          </Button>
        )}
      </form>

      <StickyAction>
        <Button type="submit" form="place" size="lg" className="w-full" disabled={saving || uploading}>
          {saving ? 'Salvando…' : 'Salvar lugar'}
        </Button>
      </StickyAction>
    </Screen>
  )
}
