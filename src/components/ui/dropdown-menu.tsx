'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'plasmo-bg-popover plasmo-text-popover-foreground data-[state=open]:plasmo-animate-in data-[state=closed]:plasmo-animate-out data-[state=closed]:plasmo-fade-out-0 data-[state=open]:plasmo-fade-in-0 data-[state=closed]:plasmo-zoom-out-95 data-[state=open]:plasmo-zoom-in-95 data-[side=bottom]:plasmo-slide-in-from-top-2 data-[side=left]:plasmo-slide-in-from-right-2 data-[side=right]:plasmo-slide-in-from-left-2 data-[side=top]:plasmo-slide-in-from-bottom-2 plasmo-z-50 plasmo-max-h-(--radix-dropdown-menu-content-available-height) plasmo-min-w-[8rem] plasmo-origin-(--radix-dropdown-menu-content-transform-origin) plasmo-overflow-x-hidden plasmo-overflow-y-auto plasmo-rounded-md plasmo-border plasmo-p-1 plasmo-shadow-md',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:plasmo-bg-accent focus:plasmo-text-accent-foreground data-[variant=destructive]:plasmo-text-destructive data-[variant=destructive]:focus:plasmo-bg-destructive/10 dark:data-[variant=destructive]:focus:plasmo-bg-destructive/20 data-[variant=destructive]:focus:plasmo-text-destructive data-[variant=destructive]:*:[svg]:!plasmo-text-destructive [&_svg:not([class*='text-'])]:plasmo-text-muted-foreground plasmo-relative plasmo-flex plasmo-cursor-default plasmo-items-center plasmo-gap-2 plasmo-rounded-sm plasmo-px-2 plasmo-py-1.5 plasmo-text-sm plasmo-outline-hidden plasmo-select-none data-[disabled]:plasmo-pointer-events-none data-[disabled]:plasmo-opacity-50 data-[inset]:plasmo-pl-8 [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:plasmo-bg-accent focus:plasmo-text-accent-foreground plasmo-relative plasmo-flex plasmo-cursor-default plasmo-items-center plasmo-gap-2 plasmo-rounded-sm plasmo-py-1.5 plasmo-pr-2 plasmo-pl-8 plasmo-text-sm plasmo-outline-hidden plasmo-select-none data-[disabled]:plasmo-pointer-events-none data-[disabled]:plasmo-opacity-50 [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="plasmo-pointer-events-none plasmo-absolute plasmo-left-2 plasmo-flex plasmo-size-3.5 plasmo-items-center plasmo-justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="plasmo-size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:plasmo-bg-accent focus:plasmo-text-accent-foreground plasmo-relative plasmo-flex plasmo-cursor-default plasmo-items-center plasmo-gap-2 plasmo-rounded-sm plasmo-py-1.5 plasmo-pr-2 plasmo-pl-8 plasmo-text-sm plasmo-outline-hidden plasmo-select-none data-[disabled]:plasmo-pointer-events-none data-[disabled]:plasmo-opacity-50 [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4",
        className,
      )}
      {...props}
    >
      <span className="plasmo-pointer-events-none plasmo-absolute plasmo-left-2 plasmo-flex plasmo-size-3.5 plasmo-items-center plasmo-justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="plasmo-size-2 plasmo-fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'plasmo-px-2 plasmo-py-1.5 plasmo-text-sm plasmo-font-medium data-[inset]:plasmo-pl-8',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('plasmo-bg-border -plasmo-mx-1 plasmo-my-1 plasmo-h-px', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'plasmo-text-muted-foreground plasmo-ml-auto plasmo-text-xs plasmo-tracking-widest',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:plasmo-bg-accent focus:plasmo-text-accent-foreground data-[state=open]:plasmo-bg-accent data-[state=open]:plasmo-text-accent-foreground [&_svg:not([class*='text-'])]:plasmo-text-muted-foreground plasmo-flex plasmo-cursor-default plasmo-items-center plasmo-gap-2 plasmo-rounded-sm plasmo-px-2 plasmo-py-1.5 plasmo-text-sm plasmo-outline-hidden plasmo-select-none data-[inset]:plasmo-pl-8 [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="plasmo-ml-auto plasmo-size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'plasmo-bg-popover plasmo-text-popover-foreground data-[state=open]:plasmo-animate-in data-[state=closed]:plasmo-animate-out data-[state=closed]:plasmo-fade-out-0 data-[state=open]:plasmo-fade-in-0 data-[state=closed]:plasmo-zoom-out-95 data-[state=open]:plasmo-zoom-in-95 data-[side=bottom]:plasmo-slide-in-from-top-2 data-[side=left]:plasmo-slide-in-from-right-2 data-[side=right]:plasmo-slide-in-from-left-2 data-[side=top]:plasmo-slide-in-from-bottom-2 plasmo-z-50 plasmo-min-w-[8rem] plasmo-origin-(--radix-dropdown-menu-content-transform-origin) plasmo-overflow-hidden plasmo-rounded-md plasmo-border plasmo-p-1 plasmo-shadow-lg',
        className,
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
