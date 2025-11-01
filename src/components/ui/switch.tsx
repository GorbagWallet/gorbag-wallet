'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '~/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'plasmo-peer data-[state=checked]:plasmo-bg-primary data-[state=unchecked]:plasmo-bg-input focus-visible:plasmo-border-ring focus-visible:plasmo-ring-ring/50 dark:data-[state=unchecked]:plasmo-bg-input/80 plasmo-inline-flex plasmo-h-[1.15rem] plasmo-w-8 plasmo-shrink-0 plasmo-items-center plasmo-rounded-full plasmo-border plasmo-border-transparent plasmo-shadow-xs plasmo-transition-all plasmo-outline-none focus-visible:plasmo-ring-[3px] disabled:plasmo-cursor-not-allowed disabled:plasmo-opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'plasmo-bg-background dark:data-[state=unchecked]:plasmo-bg-foreground dark:data-[state=checked]:plasmo-bg-primary-foreground plasmo-pointer-events-none plasmo-block plasmo-size-4 plasmo-rounded-full plasmo-ring-0 plasmo-transition-transform data-[state=checked]:plasmo-translate-x-[calc(100%-2px)] data-[state=unchecked]:plasmo-translate-x-0'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
