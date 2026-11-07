import * as React from 'react'
import { useDirection } from '../direction'
import { useDismissableLayer } from '../dismissable-layer'
import { useFocusScopeBranch } from '../focus-scope'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import type { Scope } from '../libs/create-context'
import * as PopperPrimitive from '../popper'
import { Presence } from '../presence'
import { createSlottable } from '../slot'
import * as VisuallyHiddenPrimitive from '../visibility-hidden'
import { usePortalContext } from './portal'
import { useTooltipProviderContext } from './provider'
import { useTooltipContext } from './tooltip'
import {
  getExitSideFromRect,
  getHull,
  getPaddedExitPoints,
  getPointsFromRect,
  isPointInPolygon,
  usePopperScope,
  watchOpenTooltip,
} from './tooltip.libs'
import type { ITooltip } from './tooltip.types'

const CONTENT_NAME = 'TooltipContent'

const POPPER_VARIABLES = {
  '--gentleduck-tooltip-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
  '--gentleduck-tooltip-content-available-width': 'var(--gentleduck-popper-available-width)',
  '--gentleduck-tooltip-content-available-height': 'var(--gentleduck-popper-available-height)',
  '--gentleduck-tooltip-trigger-width': 'var(--gentleduck-popper-anchor-width)',
  '--gentleduck-tooltip-trigger-height': 'var(--gentleduck-popper-anchor-height)',
} as React.CSSProperties

type TooltipContentImplElement = React.ComponentRef<typeof PopperPrimitive.PopperContent>

export const TooltipContent = React.forwardRef<TooltipContentImplElement, ITooltip.IContentProps>(
  (props: ITooltip.IScoped<ITooltip.IContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeTooltip)
    const { forceMount = portalContext.forceMount, side = 'top', ...contentProps } = props
    const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip)

    return (
      <Presence present={forceMount || context.open}>
        <TooltipContentImpl side={side} {...contentProps} ref={forwardedRef} />
      </Presence>
    )
  },
)

TooltipContent.displayName = CONTENT_NAME

/** Keeps the tooltip open while the pointer crosses between the trigger and the content, and other triggers shut. */
function useGraceArea(scope: Scope, content: HTMLElement | null, enabled: boolean) {
  const { trigger, onDelayedClose, triggerGraceRef } = useTooltipContext(CONTENT_NAME, scope)
  const { onPointerInTransitChange } = useTooltipProviderContext(CONTENT_NAME, scope)
  const stopGraceRef = React.useRef<(() => void) | null>(null)

  const handleRemoveGraceArea = React.useCallback(() => {
    stopGraceRef.current?.()
    stopGraceRef.current = null
    onPointerInTransitChange(false)
  }, [onPointerInTransitChange])

  const handleCreateGraceArea = React.useCallback(
    (event: React.PointerEvent<HTMLElement>, hoverTarget: HTMLElement) => {
      const { currentTarget } = event
      const exitPoint = { x: event.clientX, y: event.clientY }
      const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect())
      const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide)
      const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect())
      const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints])
      const handleTrackPointerGrace = (moveEvent: PointerEvent) => {
        const target = moveEvent.target as Node
        if (currentTarget.contains(target) || hoverTarget.contains(target)) return handleRemoveGraceArea()
        if (!isPointInPolygon({ x: moveEvent.clientX, y: moveEvent.clientY }, graceArea)) {
          handleRemoveGraceArea()
          onDelayedClose()
        }
      }
      stopGraceRef.current?.()
      // Added here rather than from an effect, so it sees the move the leave came with, and in the capture phase,
      // so it ends the transit before another trigger's own handler reads it.
      document.addEventListener('pointermove', handleTrackPointerGrace, true)
      stopGraceRef.current = () => document.removeEventListener('pointermove', handleTrackPointerGrace, true)
      onPointerInTransitChange(true)
    },
    [handleRemoveGraceArea, onDelayedClose, onPointerInTransitChange],
  )

  React.useEffect(() => {
    if (enabled) return handleRemoveGraceArea
  }, [enabled, handleRemoveGraceArea])

  // Started from the trigger's and the content's own leave handlers, which React hears through one listener on its
  // root, where a listener on each cost every open tooltip two to take off as it closed.
  React.useEffect(() => {
    if (!enabled || !content) return
    triggerGraceRef.current = (event) => handleCreateGraceArea(event, content)
    return () => {
      triggerGraceRef.current = null
    }
  }, [enabled, content, triggerGraceRef, handleCreateGraceArea])

  return enabled && trigger
    ? (event: React.PointerEvent<HTMLElement>) => handleCreateGraceArea(event, trigger)
    : undefined
}

const Slottable = createSlottable('TooltipContent')

const TooltipContentImpl = React.forwardRef<TooltipContentImplElement, ITooltip.IContentImplProps>(
  (props: ITooltip.IScoped<ITooltip.IContentImplProps>, forwardedRef) => {
    const {
      __scopeTooltip,
      children,
      'aria-label': ariaLabel,
      id: idProp,
      onEscapeKeyDown,
      onPointerDownOutside,
      onPointerEnter,
      onPointerLeave,
      onFocusCapture,
      onBlurCapture,
      onPointerDownCapture,
      ...contentProps
    } = props
    const context = useTooltipContext(CONTENT_NAME, __scopeTooltip)
    const popperScope = usePopperScope(__scopeTooltip)
    const direction = useDirection(context.dir)
    const { onClose, setContentId, contentId, trigger } = context
    // State, since the content mounts in the commit that opens it and a ref read while rendering would stay null.
    const [content, setContent] = React.useState<TooltipContentImplElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, setContent)
    // Inside a modal dialog but portalled out of it, the content registers so the dialog lets focus and scroll in.
    useFocusScopeBranch(content)
    const handleContentLeave = useGraceArea(__scopeTooltip, content, !context.disableHoverableContent)

    // A child given through asChild keeps its own id over the one the content passes it.
    const childId =
      !ariaLabel && contentProps.asChild && React.isValidElement<{ id?: string }>(children)
        ? children.props.id
        : undefined
    useLayoutEffect(() => setContentId(idProp ?? childId), [idProp, childId, setContentId])

    // Closes it when another tooltip opens or its trigger scrolls. Content mounts in the commit that opens it, so it
    // hears its own tooltip's announcement too.
    React.useEffect(() => watchOpenTooltip({ contentId, trigger, onClose }), [contentId, trigger, onClose])

    const layer = useDismissableLayer<TooltipContentImplElement>(
      {
        onEscapeKeyDown,
        onPointerDownOutside: (event) => {
          onPointerDownOutside?.(event)
          // The trigger closes it on its own press, or keeps it open under disableCloseOnClick.
          if (trigger?.contains(event.target as Node)) event.preventDefault()
        },
        onFocusOutside: (event) => event.preventDefault(),
        onDismiss: onClose,
        onFocusCapture,
        onBlurCapture,
        onPointerDownCapture,
      },
      composedRefs,
    )

    return (
      <PopperPrimitive.PopperContent
        data-slot="tooltip-content"
        data-state={context.stateAttribute}
        role={ariaLabel ? undefined : 'tooltip'}
        id={ariaLabel ? undefined : contentId}
        dir={direction}
        {...popperScope}
        {...contentProps}
        {...layer}
        updateOnScroll={false}
        onPointerEnter={
          context.disableHoverableContent
            ? onPointerEnter
            : composeEventHandlers(onPointerEnter, context.onContentEnter)
        }
        onPointerLeave={composeEventHandlers(onPointerLeave, handleContentLeave)}
        style={{ ...contentProps.style, ...POPPER_VARIABLES }}>
        {ariaLabel
          ? [
              <Slottable key="content">{children}</Slottable>,
              <VisuallyHiddenPrimitive.Root key="label" id={contentId} role="tooltip">
                {ariaLabel}
              </VisuallyHiddenPrimitive.Root>,
            ]
          : children}
      </PopperPrimitive.PopperContent>
    )
  },
)

TooltipContentImpl.displayName = `${CONTENT_NAME}Impl`
