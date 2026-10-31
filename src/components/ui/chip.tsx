import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Pílula de seleção (filtros e opções). */
export function Chip({
  active,
  tone = 'dark',
  className,
  ...props
}: ComponentProps<'button'> & { active: boolean; tone?: 'dark' | 'primary' }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        tone === 'dark' &&
          (active
            ? 'border-[1.5px] border-foreground bg-foreground font-extrabold text-background'
            : 'border-[1.5px] border-input bg-background font-semibold text-foreground'),
        tone === 'primary' &&
          (active ? 'bg-primary font-extrabold text-primary-foreground' : 'bg-muted font-semibold text-foreground'),
        className,
      )}
      {...props}
    />
  )
}
