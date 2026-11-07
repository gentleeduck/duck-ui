import * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import { useId } from '../hooks/use-id'
import { createContextScope } from '../libs/create-context'
import * as PopperPrimitive from '../popper'
import { createPopperScope } from '../popper'
import type { IPopover } from './popover.types'

const POPOVER_NAME = 'Popover'

export const [createPopoverContext, createPopoverScope] = createContextScope(POPOVER_NAME, [createPopperScope])

export const usePopperScope = createPopperScope()

export const [PopoverProvider, usePopoverContext] = createPopoverContext<IPopover.IContext>(POPOVER_NAME)

export function Popover(props: IPopover.IScoped<IPopover.IProps>) {
  const { __scopePopover, children, open: openProp, defaultOpen, onOpenChange, dir, modal = false } = props

  const popperScope = usePopperScope(__scopePopover)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false)
  const contentId = useId()

  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: POPOVER_NAME,
  })
  const onOpenToggle = React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen])
  const onCustomAnchorAdd = React.useCallback(() => setHasCustomAnchor(true), [])
  const onCustomAnchorRemove = React.useCallback(() => setHasCustomAnchor(false), [])

  return (
    <PopperPrimitive.Popper {...popperScope}>
      <PopoverProvider
        scope={__scopePopover}
        contentId={contentId}
        triggerRef={triggerRef}
        open={open}
        onOpenChange={setOpen}
        onOpenToggle={onOpenToggle}
        hasCustomAnchor={hasCustomAnchor}
        onCustomAnchorAdd={onCustomAnchorAdd}
        onCustomAnchorRemove={onCustomAnchorRemove}
        modal={modal}
        dir={dir}>
        {children}
      </PopoverProvider>
    </PopperPrimitive.Popper>
  )
}

Popover.displayName = POPOVER_NAME
