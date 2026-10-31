import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Select nativo: no celular abre o seletor do sistema, que é o mais rápido de usar. */
export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'h-12 w-full rounded-lg font-medium border-[1.5px] border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring',
        className,
      )}
      {...props}
    />
  )
}
