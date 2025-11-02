'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '~/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('plasmo-flex plasmo-flex-col plasmo-gap-2', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'plasmo-bg-muted plasmo-text-muted-foreground plasmo-inline-flex plasmo-h-9 plasmo-w-fit plasmo-items-center plasmo-justify-center plasmo-rounded-lg plasmo-p-[3px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:plasmo-bg-background dark:data-[state=active]:plasmo-text-foreground focus-visible:plasmo-border-ring focus-visible:plasmo-ring-ring/50 focus-visible:plasmo-outline-ring dark:data-[state=active]:plasmo-border-input dark:data-[state=active]:plasmo-bg-input/30 plasmo-text-foreground dark:plasmo-text-muted-foreground plasmo-inline-flex plasmo-h-[calc(100%-1px)] plasmo-flex-1 plasmo-items-center plasmo-justify-center plasmo-gap-1.5 plasmo-rounded-md plasmo-border plasmo-border-transparent plasmo-px-2 plasmo-py-1 plasmo-text-sm plasmo-font-medium plasmo-whitespace-nowrap plasmo-transition-[color,box-shadow] focus-visible:plasmo-ring-[3px] focus-visible:plasmo-outline-1 disabled:plasmo-pointer-events-none disabled:plasmo-opacity-50 data-[state=active]:plasmo-shadow-sm [&_svg]:plasmo-pointer-events-none [&_svg]:plasmo-shrink-0 [&_svg:not([class*='size-'])]:plasmo-size-4",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('plasmo-flex-1 plasmo-outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
