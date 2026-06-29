"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function Tabs(props: any) {
  return <TabsPrimitive.Root {...props} />
}

function TabsList(props: any) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1",
        className
      )}
      {...rest}
    />
  )
}

function TabsTrigger(props: any) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...rest}
    />
  )
}

function TabsContent(props: any) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.Content
      className={cn("mt-2", className)}
      {...rest}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }