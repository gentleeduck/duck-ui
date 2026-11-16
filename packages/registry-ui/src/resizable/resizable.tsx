'use client'

import { cn } from '@gentleduck/libs/cn'
import type { IDirection } from '@gentleduck/primitives/direction'
import { useDirection } from '@gentleduck/primitives/direction'
import { GripVertical } from 'lucide-react'
import React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { toDirection } from '../direction/direction.libs'

const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Group> & { dir?: IDirection.Kind }
>(({ className, dir, ...props }, ref) => {
  const direction = useDirection(toDirection(dir))
  return (
    <ResizablePrimitive.Group
      className={cn('flex size-full', className)}
      data-slot="panel-group"
      dir={direction}
      elementRef={ref}
      {...props}
    />
  )
})
ResizablePanelGroup.displayName = 'ResizablePanelGroup'

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Separator> & {
    withHandle?: boolean
  }
>(({ withHandle = true, className, ...props }, ref) => (
  <ResizablePrimitive.Separator
    // The group pairs a separator with its panels only when it mounts, and leaves out one that mounts disabled.
    key={props.disabled ? 'disabled' : 'enabled'}
    elementRef={ref}
    aria-label="Resize panels"
    className={cn(
      // Default (vertical line - sits inside a horizontal group)
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
      // Horizontal line (sits inside a vertical group - react-resizable-panels sets aria-orientation="horizontal")
      'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full',
      'aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2',
      'aria-[orientation=horizontal]:[&>div]:rotate-90',
      'aria-disabled:opacity-50',
      className,
    )}
    data-slot="panel-resize-handle"
    {...props}>
    {withHandle && (
      <div
        className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background shadow-sm"
        data-slot="panel-handle">
        <GripVertical aria-hidden="true" className="size-2.5" />
      </div>
    )}
  </ResizablePrimitive.Separator>
))
ResizableHandle.displayName = 'ResizableHandle'

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
