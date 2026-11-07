import * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import { createContextScope } from '../libs/create-context'
import * as PopperPrimitive from '../popper'
import { createPopperScope } from '../popper'
import type { IHoverCard } from './hover-card.types'

const HOVERCARD_NAME = 'HoverCard'

export const [createHoverCardContext, createHoverCardScope] = createContextScope(HOVERCARD_NAME, [createPopperScope])

export const usePopperScope = createPopperScope()

export const [HoverCardProvider, useHoverCardContext] = createHoverCardContext<IHoverCard.IContext>(HOVERCARD_NAME)

export const HoverCard: React.FC<IHoverCard.IProps> = (props: IHoverCard.IScoped<IHoverCard.IProps>) => {
  const {
    __scopeHoverCard,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300,
    dir,
    disabled = false,
  } = props
  const popperScope = usePopperScope(__scopeHoverCard)
  const openTimerRef = React.useRef(0)
  const closeTimerRef = React.useRef(0)
  const hasSelectionRef = React.useRef(false)
  const isPointerDownOnContentRef = React.useRef(false)

  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: HOVERCARD_NAME,
  })

  const handleOpen = React.useCallback(() => {
    if (disabled) return
    window.clearTimeout(closeTimerRef.current)
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay)
  }, [openDelay, setOpen, disabled])

  const handleClose = React.useCallback(() => {
    window.clearTimeout(openTimerRef.current)
    // Read when the delay ends: a release finds out whether it selected text only a frame after it.
    closeTimerRef.current = window.setTimeout(() => {
      if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) setOpen(false)
    }, closeDelay)
  }, [closeDelay, setOpen])

  const handleDismiss = React.useCallback(() => setOpen(false), [setOpen])

  React.useEffect(() => {
    if (!disabled) return
    window.clearTimeout(openTimerRef.current)
    setOpen(false)
  }, [disabled, setOpen])

  React.useEffect(() => {
    return () => {
      window.clearTimeout(openTimerRef.current)
      window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <HoverCardProvider
      scope={__scopeHoverCard}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      onDismiss={handleDismiss}
      hasSelectionRef={hasSelectionRef}
      isPointerDownOnContentRef={isPointerDownOnContentRef}
      dir={dir}>
      <PopperPrimitive.Root {...popperScope}>{children}</PopperPrimitive.Root>
    </HoverCardProvider>
  )
}

HoverCard.displayName = HOVERCARD_NAME
