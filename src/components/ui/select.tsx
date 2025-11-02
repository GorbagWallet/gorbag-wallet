'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "plasmo-border-input data-[placeholder]:plasmo-text-muted-foreground [&_svg:not([class*='text-'])]:plasmo-text-muted-foreground focus-visible:plasmo-border-ring focus-visible:plasmo-ring-ring/50 aria-invalid:plasmo-ring-destructive/20 dark:aria-invalid:plasmo-ring-destructive/40 aria-invalid:plasmo-border-destructive dark:plasmo-bg-input/30 dark:hover:plasmo-bg-input/50 plasmo-flex plasmo-w-fit plasmo-items-center plasmo-justify-between plasmo-gap-2 plasmo-rounded-md plasmo-border plasmo-bg-transparent plasmo-px-3 plasmo-py-2 plasmo-text-sm plasmo-whitespace-nowrap plasmo-shadow-xs plasmo-transition-[color,box-shadow] plasmo-outline-none focus-visible:plasmo-ring-[3px] disabled:plasmo-cursor-not-allowed disabled:plasmo-opacity-50 data-[size=default]:plasmo-h-9 data-[size=sm]:plasmo-h-8 *:data-[slot=select-value]:plasmo-line-clamp-1 *:data-[slot=select-value]:plasmo-flex *:data-[slot=select-value]:plasmo-items-center *:data-[slot=select-value]:plasmo-gap-2 [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="plasmo-size-4 plasmo-opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'plasmo-bg-popover plasmo-text-popover-foreground data-[state=open]:plasmo-animate-in data-[state=closed]:plasmo-animate-out data-[state=closed]:plasmo-fade-out-0 data-[state=open]:plasmo-fade-in-0 data-[state=closed]:plasmo-zoom-out-95 data-[state=open]:plasmo-zoom-in-95 data-[side=bottom]:plasmo-slide-in-from-top-2 data-[side=left]:plasmo-slide-in-from-right-2 data-[side=right]:plasmo-slide-in-from-left-2 data-[side=top]:plasmo-slide-in-from-bottom-2 plasmo-relative plasmo-z-50 max-h-(--radix-select-content-available-height) plasmo-min-w-[8rem] origin-(--radix-select-content-transform-origin) plasmo-overflow-x-hidden plasmo-overflow-y-auto plasmo-rounded-md plasmo-border plasmo-shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:plasmo-translate-y-1 data-[side=left]:-plasmo-translate-x-1 data-[side=right]:plasmo-translate-x-1 data-[side=top]:-plasmo-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'plasmo-p-1',
            position === 'popper' &&
              'plasmo-h-[var(--radix-select-trigger-height)] plasmo-w-full plasmo-min-w-[var(--radix-select-trigger-width)] plasmo-scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('plasmo-text-muted-foreground plasmo-px-2 plasmo-py-1.5 plasmo-text-xs', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:plasmo-bg-accent focus:plasmo-text-accent-foreground [&_svg:not([class*='text-'])]:plasmo-text-muted-foreground plasmo-relative plasmo-flex plasmo-w-full plasmo-cursor-default plasmo-items-center plasmo-gap-2 plasmo-rounded-sm plasmo-py-1.5 plasmo-pr-8 plasmo-pl-2 plasmo-text-sm plasmo-outline-hidden plasmo-select-none data-[disabled]:plasmo-pointer-events-none data-[disabled]:plasmo-opacity-50 [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4 *:[span]:last:plasmo-flex *:[span]:last:plasmo-items-center *:[span]:last:plasmo-gap-2",
        className,
      )}
      {...props}
    >
      <span className="plasmo-absolute plasmo-right-2 plasmo-flex plasmo-size-3.5 plasmo-items-center plasmo-justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="plasmo-size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('plasmo-bg-border plasmo-pointer-events-none plasmo--mx-1 plasmo-my-1 plasmo-h-px', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'plasmo-flex plasmo-cursor-default plasmo-items-center plasmo-justify-center plasmo-py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="plasmo-size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'plasmo-flex plasmo-cursor-default plasmo-items-center plasmo-justify-center plasmo-py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="plasmo-size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
