import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-lg border-[1.5px] font-medium border-input bg-background px-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring',
        className,
      )}
      {...props}
    />
  )
}
