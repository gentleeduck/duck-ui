import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import type { IPoint } from '../libs/shared-utils'
import * as MenuPrimitive from '../menu'
import { Primitive } from '../primitive-elements'
import { useContextMenuContext, useMenuScope } from './context-menu'
import type { IContextMenu } from './context-menu.types'

const TRIGGER_NAME = 'ContextMenuTrigger'

// Nested triggers all receive one bubbling pointerdown, and only the innermost may start a long press.
const claimedLongPressEvents = new WeakSet<Event>()

const ContextMenuTrigger = React.forwardRef<HTMLSpanElement, IContextMenu.ITriggerProps>(
  (props: IContextMenu.IScoped<IContextMenu.ITriggerProps>, forwardedRef) => {
    const { __scopeContextMenu, disabled = false, ...triggerProps } = props
    const context = useContextMenuContext(TRIGGER_NAME, __scopeContextMenu)
    const menuScope = useMenuScope(__scopeContextMenu)
    const pointRef = React.useRef<IPoint>({ x: 0, y: 0 })
    const atPoint = () => ({
      current: { getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }) },
    })
    // The popper places the menu again only for a new anchor, which a menu still mounted needs to move to the point.
    const [virtualRef, setVirtualRef] = React.useState(atPoint)
    const longPressTimerRef = React.useRef(0)
    const pressRef = React.useRef<IPoint>({ x: 0, y: 0 })
    const clearLongPress = React.useCallback(() => window.clearTimeout(longPressTimerRef.current), [])
    const handleOpen = (event: React.MouseEvent | React.PointerEvent) => {
      context.hasInteractedRef.current = true
      pointRef.current = { x: event.clientX, y: event.clientY }
      setVirtualRef(atPoint())
      context.onOpenChange(true)
    }

    React.useEffect(() => clearLongPress, [clearLongPress])
    React.useEffect(() => void (disabled && clearLongPress()), [disabled, clearLongPress])

    return (
      <>
        <MenuPrimitive.Anchor {...menuScope} virtualRef={virtualRef} />
        <Primitive.span
          data-slot="context-menu-trigger"
          data-state={context.open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          {...triggerProps}
          ref={forwardedRef}
          style={{ WebkitTouchCallout: 'none', ...props.style }}
          onContextMenu={
            disabled
              ? props.onContextMenu
              : composeEventHandlers(props.onContextMenu, (event) => {
                  clearLongPress()
                  event.preventDefault()
                  if (context.rightClickClosesRef.current) {
                    context.rightClickClosesRef.current = false
                    return
                  }
                  handleOpen(event)
                })
          }
          onPointerDown={
            disabled
              ? props.onPointerDown
              : composeEventHandlers(props.onPointerDown, (event) => {
                  if (event.pointerType === 'mouse') return
                  clearLongPress()
                  if (claimedLongPressEvents.has(event.nativeEvent)) return
                  claimedLongPressEvents.add(event.nativeEvent)
                  context.onOpenChange(false)
                  pressRef.current = { x: event.clientX, y: event.clientY }
                  longPressTimerRef.current = window.setTimeout(() => handleOpen(event), 700)
                })
          }
          onPointerMove={composeEventHandlers(
            props.onPointerMove,
            whenTouchOrPen((event) => {
              // A held finger drifts, so only a move past 10px gives up the press.
              if (Math.hypot(event.clientX - pressRef.current.x, event.clientY - pressRef.current.y) > 10) {
                clearLongPress()
              }
            }),
          )}
          onPointerCancel={composeEventHandlers(props.onPointerCancel, whenTouchOrPen(clearLongPress))}
          onPointerUp={composeEventHandlers(props.onPointerUp, whenTouchOrPen(clearLongPress))}
        />
      </>
    )
  },
)

ContextMenuTrigger.displayName = TRIGGER_NAME

function whenTouchOrPen<E>(handler: React.PointerEventHandler<E>): React.PointerEventHandler<E> {
  return (event) => (event.pointerType !== 'mouse' ? handler(event) : undefined)
}

export { ContextMenuTrigger, whenTouchOrPen }
