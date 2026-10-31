import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full min-w-0 resize-none font-medium rounded-lg border-[1.5px] border-input bg-background px-3.5 py-3 text-base leading-snug text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring',
        className,
      )}
      {...props}
    />
  )
}
