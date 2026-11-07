import * as React from 'react'
import { createTooltipContext } from './tooltip.libs'
import type { ITooltip } from './tooltip.types'

const PROVIDER_NAME = 'TooltipProvider'
const DEFAULT_DELAY_DURATION = 700

export const [TooltipProviderContextProvider, useTooltipProviderContext] =
  createTooltipContext<ITooltip.IProviderContext>(PROVIDER_NAME)

export const TooltipProvider: React.FC<ITooltip.IProviderProps> = (
  props: ITooltip.IScoped<ITooltip.IProviderProps>,
) => {
  const {
    __scopeTooltip,
    delayDuration = DEFAULT_DELAY_DURATION,
    closeDelay = 0,
    skipDelayDuration = 300,
    disableHoverableContent = false,
    children,
  } = props
  const isOpenDelayedRef = React.useRef(true)
  const isPointerInTransitRef = React.useRef(false)
  const skipDelayTimerRef = React.useRef<number>(undefined)

  return (
    <TooltipProviderContextProvider
      scope={__scopeTooltip}
      isOpenDelayedRef={isOpenDelayedRef}
      delayDuration={delayDuration}
      closeDelay={closeDelay}
      onOpen={React.useCallback(() => {
        if (skipDelayDuration <= 0) return
        window.clearTimeout(skipDelayTimerRef.current)
        isOpenDelayedRef.current = false
      }, [skipDelayDuration])}
      onClose={React.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current)
        skipDelayTimerRef.current = window.setTimeout(() => (isOpenDelayedRef.current = true), skipDelayDuration)
      }, [skipDelayDuration])}
      isPointerInTransitRef={isPointerInTransitRef}
      onPointerInTransitChange={React.useCallback((inTransit: boolean) => {
        isPointerInTransitRef.current = inTransit
      }, [])}
      disableHoverableContent={disableHoverableContent}>
      {children}
    </TooltipProviderContextProvider>
  )
}

TooltipProvider.displayName = PROVIDER_NAME
