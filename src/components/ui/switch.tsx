import { Switch as SwitchPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-kids data-[state=unchecked]:bg-control-off',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[26px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}
