import { Copy } from 'lucide-react'
import type React from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { WEEKDAYS, type DayHours, type OpeningHours } from '@/lib/types'

const DEFAULT_DAY: DayHours = { open: '11:00', close: '23:00' }
export const DEFAULT_WEEK: OpeningHours = Array.from({ length: 7 }, () => ({ ...DEFAULT_DAY }))

const timeCls =
  'h-10 min-w-0 flex-1 rounded-md border-[1.5px] border-line bg-background px-2 text-center text-sm font-semibold tabular-nums outline-none transition-colors focus-visible:border-foreground'

/**
 * Horário por dia da semana. Começa pela segunda, que é como a gente lê.
 * Cada dia pode estar aberto (com abre/fecha) ou fechado.
 */
export function HoursEditor({ value, onChange }: { value: OpeningHours; onChange: (v: OpeningHours) => void }) {
  const order = [1, 2, 3, 4, 5, 6, 0]
  const setDay = (i: number, d: DayHours | null) => onChange(value.map((x, j) => (j === i ? d : x)))
  const first = order.map((i) => value[i]).find(Boolean)

  return (
    <div className="flex flex-col gap-2">
      {order.map((i, k) => {
        const d = value[i]
        return (
          <div
            key={i}
            className={cn('animate-rise stagger grid grid-cols-[2.75rem_auto_minmax(0,1fr)] items-center gap-2.5 transition-opacity', !d && 'opacity-60')}
            style={{ '--i': k } as React.CSSProperties}
          >
            <span className="text-sm font-bold">
              {WEEKDAYS[i]}
            </span>
            <Switch
              aria-label={`${WEEKDAYS[i]} aberto`}
              checked={!!d}
              onCheckedChange={(on) => setDay(i, on ? (first ? { ...first } : { ...DEFAULT_DAY }) : null)}
            />
            {d ? (
              <div className="animate-pop flex min-w-0 items-center gap-1.5">
                <input
                  type="time"
                  aria-label={`${WEEKDAYS[i]} abre`}
                  value={d.open}
                  onChange={(e) => setDay(i, { ...d, open: e.target.value })}
                  className={timeCls}
                />
                <span className="text-xs font-semibold text-muted-foreground">às</span>
                <input
                  type="time"
                  aria-label={`${WEEKDAYS[i]} fecha`}
                  value={d.close}
                  onChange={(e) => setDay(i, { ...d, close: e.target.value })}
                  className={timeCls}
                />
              </div>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">Fechado</span>
            )}
          </div>
        )
      })}
      {first && (
        <button
          type="button"
          onClick={() => onChange(value.map((d) => (d ? { ...first } : null)))}
          className="mt-1 flex cursor-pointer items-center gap-1.5 self-start rounded-full px-1 py-1 text-xs font-bold text-primary"
        >
          <Copy size={14} aria-hidden="true" /> Usar o horário de {WEEKDAYS[order.find((i) => value[i])!]} nos dias abertos
        </button>
      )}
    </div>
  )
}
