'use client'

import { cn } from '@gentleduck/libs/cn'
import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import { MountMinimal } from '@gentleduck/primitives/mount'
import * as React from 'react'
import { Button } from '../button'

const CollapsibleContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  wrapperRef: React.RefObject<HTMLDivElement | null>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  contentId: string
} | null>(null)

export function useCollapsible() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible')
  }
  return context
}

function useForwardedRef<T>(own: React.RefObject<T | null>, ref: React.ForwardedRef<T>) {
  return React.useCallback(
    (node: T | null) => {
      own.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [own, ref],
  )
}

const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
  }
>(({ children, className, open: openProp, onOpenChange, defaultOpen = false, ...props }, ref) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLElement>(null)
  const [open, setOpen] = useControllableState({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const contentId = React.useId()
  const wrapperRefs = useForwardedRef(wrapperRef, ref)

  const ctxValue = React.useMemo(
    () => ({ contentId, contentRef, onOpenChange: setOpen, open, triggerRef, wrapperRef }),
    [contentId, setOpen, open],
  )

  return (
    <CollapsibleContext.Provider value={ctxValue}>
      <div
        className={cn('flex flex-col gap-2', className)}
        data-slot="collapsible"
        ref={wrapperRefs}
        {...props}
        data-open={open}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
})
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ children, onClick, ...props }, ref) => {
    const { open, onOpenChange, triggerRef, contentId } = useCollapsible()
    const triggerRefs = useForwardedRef(triggerRef, ref)

    return (
      <Button
        aria-controls={contentId}
        aria-expanded={open}
        data-open={open}
        data-slot="collapsible-trigger"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event)
          if (!event.defaultPrevented) onOpenChange(!open)
        }}
        ref={triggerRefs}
        variant="ghost"
        {...props}>
        {children}
      </Button>
    )
  },
)
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLDivElement> & { forceMount?: boolean }
>(({ children, forceMount = false, className, ...props }, ref) => {
  const { open, contentRef, contentId } = useCollapsible()
  const contentRefs = useForwardedRef(contentRef, ref)

  return (
    <section
      aria-hidden={!open}
      className={cn(
        'h-0 overflow-hidden [interpolate-size:allow-keywords] data-[open=true]:h-auto',
        'transition-[height] duration-200 ease-(--gentleduck-motion-ease)',
        className,
      )}
      data-open={open}
      inert={!open || undefined}
      data-slot="collapsible-content"
      id={contentId}
      ref={contentRefs}
      {...props}>
      <MountMinimal forceMount={forceMount} open={open} ref={contentRef}>
        {children}
      </MountMinimal>
    </section>
  )
})
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleContent, CollapsibleTrigger, useForwardedRef }
