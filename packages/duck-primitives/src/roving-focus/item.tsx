import * as React from 'react'
import { useId } from '../hooks/use-id'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { NO_GROUP, useRovingFocusContext } from './roving-focus'
import { focusFirst, getFocusableItems, getFocusIntent, wrapArray } from './roving-focus.libs'
import type { IRovingFocus } from './roving-focus.types'

const ITEM_NAME = 'RovingFocusGroupItem'

/** An item's tab stop and keys, spread onto the element that takes focus, so an item costs no element of its own. */
function useRovingFocusItem<E extends HTMLElement>(
  props: IRovingFocus.IScoped<IRovingFocus.IItemOptions & IRovingFocus.IItemHandlers<E>>,
  forwardedRef: React.Ref<E> | undefined,
  enabled = true,
): IRovingFocus.IItemBindings<E> {
  const { __scopeRovingFocusGroup, focusable = true, active = false, tabStopId, textValue } = props
  const autoId = useId()
  const id = tabStopId || autoId
  const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup)
  if (enabled && context === NO_GROUP) throw new Error(`\`${ITEM_NAME}\` must be used within \`RovingFocusGroup\``)
  const isCurrentTabStop = context.currentTabStopId === id
  const state = { isCurrentTabStop, hasTabStop: context.currentTabStopId !== null }
  const ref = React.useRef<E>(null)
  const composedRef = useComposedRefs(forwardedRef, ref)

  const { items, register } = context

  useLayoutEffect(() => {
    if (enabled) return register({ ref, id, focusable, active, textValue })
  }, [enabled, register, id, focusable, active, textValue])

  if (!enabled) {
    const { onMouseDown, onFocus, onKeyDown } = props
    return { state, attributes: undefined, handlers: { ref: composedRef, onMouseDown, onFocus, onKeyDown } }
  }

  return {
    state,
    attributes: { tabIndex: isCurrentTabStop ? 0 : -1, 'data-orientation': context.orientation },
    handlers: {
      ref: composedRef,
      onMouseDown: composeEventHandlers(props.onMouseDown, (event: React.MouseEvent<E>) => {
        if (!focusable) event.preventDefault()
        else context.onItemFocus(id)
      }),
      onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
      onKeyDown: composeEventHandlers(props.onKeyDown, (event: React.KeyboardEvent<E>) => {
        if (event.key === 'Tab' && event.shiftKey) {
          context.onItemShiftTab()
          return
        }

        if (event.target !== event.currentTarget) return

        const focusIntent = getFocusIntent(event, context.orientation, context.dir)
        if (focusIntent === undefined) return
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
        event.preventDefault()

        let candidateNodes = getFocusableItems(items).map(({ node }) => node)

        if (focusIntent === 'last') {
          candidateNodes.reverse()
        } else if (focusIntent === 'prev' || focusIntent === 'next') {
          if (focusIntent === 'prev') candidateNodes.reverse()
          // Focus moves a task later, so a press before it lands counts from where the last one is taking it.
          const from = context.pendingFocusRef.current ?? event.currentTarget
          const currentIndex = candidateNodes.indexOf(from)
          candidateNodes = context.loop
            ? wrapArray(candidateNodes, currentIndex + 1)
            : candidateNodes.slice(currentIndex + 1)
        }

        const [next] = candidateNodes
        if (next) context.pendingFocusRef.current = next
        setTimeout(() => {
          if (context.pendingFocusRef.current === next) context.pendingFocusRef.current = null
          focusFirst(candidateNodes)
        })
      }),
    },
  }
}

type RovingFocusItemElement = React.ComponentRef<typeof Primitive.span>

const RovingFocusGroupItem = React.forwardRef<RovingFocusItemElement, IRovingFocus.IItemProps>(
  (props: IRovingFocus.IScoped<IRovingFocus.IItemProps>, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable,
      active,
      tabStopId,
      textValue,
      children,
      onMouseDown,
      onFocus,
      onKeyDown,
      ...itemProps
    } = props
    const item = useRovingFocusItem(props, forwardedRef)

    return (
      <Primitive.span data-slot="roving-focus-item" {...item.attributes} {...itemProps} {...item.handlers}>
        {typeof children === 'function' ? children(item.state) : children}
      </Primitive.span>
    )
  },
)

RovingFocusGroupItem.displayName = ITEM_NAME

export { RovingFocusGroupItem, useRovingFocusItem }
