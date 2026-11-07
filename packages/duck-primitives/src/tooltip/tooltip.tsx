import * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import { useId } from '../hooks/use-id'
import * as PopperPrimitive from '../popper'
import { useTooltipProviderContext } from './provider'
import { createTooltipContext, TOOLTIP_OPEN, usePopperScope } from './tooltip.libs'
import type { ITooltip } from './tooltip.types'

export { createTooltipScope, TOOLTIP_OPEN, usePopperScope } from './tooltip.libs'

const TOOLTIP_NAME = 'Tooltip'

export const [TooltipContextProvider, useTooltipContext] = createTooltipContext<ITooltip.IContext>(TOOLTIP_NAME)

export const Tooltip: React.FC<ITooltip.IProps> = (props: ITooltip.IScoped<ITooltip.IProps>) => {
  const {
    __scopeTooltip,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disableHoverableContent: disableHoverableContentProp,
    delayDuration: delayDurationProp,
    closeDelay: closeDelayProp,
    dir,
    disabled = false,
  } = props
  const providerContext = useTooltipProviderContext(TOOLTIP_NAME, props.__scopeTooltip)
  const popperScope = usePopperScope(__scopeTooltip)
  const [trigger, setTrigger] = React.useState<HTMLButtonElement | null>(null)
  const generatedContentId = useId()
  const [givenContentId, setContentId] = React.useState<string>()
  const timerRef = React.useRef<number>(undefined)
  const disableHoverableContent = disableHoverableContentProp ?? providerContext.disableHoverableContent
  const delayDuration = delayDurationProp ?? providerContext.delayDuration
  const closeDelay = closeDelayProp ?? providerContext.closeDelay
  const wasOpenDelayedRef = React.useRef(false)
  const triggerGraceRef = React.useRef<((event: React.PointerEvent<HTMLElement>) => void) | null>(null)
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: (open) => {
      if (open) {
        providerContext.onOpen()
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN, { detail: givenContentId ?? generatedContentId }))
      } else {
        providerContext.onClose()
      }
      onOpenChange?.(open)
    },
    caller: TOOLTIP_NAME,
  })
  const stateAttribute = React.useMemo(() => {
    return open ? (wasOpenDelayedRef.current ? 'delayed-open' : 'instant-open') : 'closed'
  }, [open])

  const clearTimer = React.useCallback(() => window.clearTimeout(timerRef.current), [])

  const handleOpen = React.useCallback(() => {
    if (disabled) return
    clearTimer()
    wasOpenDelayedRef.current = false
    setOpen(true)
  }, [setOpen, disabled, clearTimer])

  const handleClose = React.useCallback(() => {
    clearTimer()
    setOpen(false)
  }, [setOpen, clearTimer])

  const handleDelayedOpen = React.useCallback(() => {
    if (disabled) return
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      wasOpenDelayedRef.current = true
      setOpen(true)
    }, delayDuration)
  }, [delayDuration, setOpen, disabled, clearTimer])

  const handleDelayedClose = React.useCallback(() => {
    if (closeDelay <= 0) return handleClose()
    clearTimer()
    timerRef.current = window.setTimeout(handleClose, closeDelay)
  }, [closeDelay, handleClose, clearTimer])

  React.useEffect(() => {
    if (disabled) handleClose()
  }, [disabled, handleClose])

  React.useEffect(() => clearTimer, [clearTimer])

  const onTriggerEnter = React.useCallback(() => {
    if (providerContext.isOpenDelayedRef.current) handleDelayedOpen()
    else handleOpen()
  }, [providerContext.isOpenDelayedRef, handleDelayedOpen, handleOpen])

  const onTriggerLeave = React.useCallback(() => {
    if (disableHoverableContent) handleDelayedClose()
    else clearTimer()
  }, [handleDelayedClose, disableHoverableContent, clearTimer])

  return (
    <PopperPrimitive.Popper {...popperScope} anchor={trigger}>
      <TooltipContextProvider
        scope={__scopeTooltip}
        contentId={givenContentId ?? generatedContentId}
        setContentId={setContentId}
        open={open}
        stateAttribute={stateAttribute}
        trigger={trigger}
        onTriggerChange={setTrigger}
        onTriggerEnter={onTriggerEnter}
        onTriggerLeave={onTriggerLeave}
        triggerGraceRef={triggerGraceRef}
        onContentEnter={clearTimer}
        onOpen={handleOpen}
        onClose={handleClose}
        onDelayedClose={handleDelayedClose}
        disableHoverableContent={disableHoverableContent}
        dir={dir}>
        {children}
      </TooltipContextProvider>
    </PopperPrimitive.Popper>
  )
}

Tooltip.displayName = TOOLTIP_NAME
