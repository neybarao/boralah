import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label data-slot="label" className={cn('flex flex-col gap-2 text-sm font-bold', className)} {...props} />
}
