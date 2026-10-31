import { Switch as SwitchPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-kids data-[state=unchecked]:bg-[#b9afa7]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[26px] rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}
