import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold', {
  variants: {
    variant: {
      kids: 'bg-kids-soft text-kids',
      new: 'bg-primary/10 text-primary',
      neutral: 'bg-muted text-[#4a423c]',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

export function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
